import sys, json, numpy as np
from PIL import Image
from scipy import ndimage as nd
BIG=None; F=1; ROWAUTO=True; DEBUG=False
def key(path):
    global BIG,F
    src=Image.open(path).convert('RGB'); F=1; BIG=None
    if src.width>2600:                                        # pasada por Upscayl (x4): se mira a 1/4 y se recorta a 1/2
        F=2; big=src.resize((src.width//2,src.height//2),Image.LANCZOS); src=src.resize((src.width//4,src.height//4),Image.LANCZOS)
        BIG=_key(np.asarray(big).astype(np.float32))[0]
    return _key(np.asarray(src).astype(np.float32))
def _key(im):
    h,w,_=im.shape
    cs=np.concatenate([im[:8,:8].reshape(-1,3),im[:8,-8:].reshape(-1,3),im[-8:,:8].reshape(-1,3),im[-8:,-8:].reshape(-1,3)])
    bg=np.median(cs,0)
    d=np.sqrt(((im-bg)**2).sum(2))
    a=np.clip((d-45)/90,0,1)
    # despill: un-mix background
    aa=np.maximum(a,1e-3)[...,None]
    rgb=np.clip((im-(1-aa)*bg)/aa,0,255)
    ch=int(np.argmax(bg)); o=[i for i in range(3) if i!=ch]       # quita el color del fondo que se queda pegado (azul -> morado, verde -> verdoso)
    rgb[...,ch]=np.minimum(rgb[...,ch],np.maximum(rgb[...,o[0]],rgb[...,o[1]]))
    return np.dstack([rgb,a*255]).astype(np.uint8), a
def segs(p,thr,mingap):
    on=p>thr; S=[];i=0;n=len(on)
    while i<n:
        if on[i]:
            j=i
            while j<n and (on[j] or (j+mingap<n and on[j:j+mingap].any())): j+=1
            S.append([i,j]); i=j
        else: i+=1
    return S
def proc(path, nrows=5, ncols=None, maxh=150):
    rgba,a=key(path); m=a>.15
    rr=m.mean(1)>.88; cc=m.mean(0)>.88                      # líneas de rejilla que pinta Gemini
    for arr,ax in ((rr,0),(cc,1)):
        for i in np.where(arr)[0]:
            sl=slice(max(0,i-2),i+3)
            if ax==0: m[sl]=False; a[sl]=0; rgba[sl,:,3]=0
            else: m[:,sl]=False; a[:,sl]=0; rgba[:,sl,3]=0
    lab,n=nd.label(nd.binary_dilation(m,structure=np.ones((3,11))))
    for i,sl in enumerate(nd.find_objects(lab)):
        h=sl[0].stop-sl[0].start; w=sl[1].stop-sl[1].start
        if h<=40 and w>2.2*h and w>30 and sl[1].start<a.shape[1]*.06:
            reg=lab[sl]==i+1; m[sl][reg]=False; a[sl][reg]=0; rgba[sl][...,3][reg]=0
    md=nd.binary_dilation(m,structure=np.ones((15,3)))     # rellena el hueco de los anillos
    rows=segs(md.sum(1),2,4)
    hs=[r[1]-r[0] for r in rows]; med=np.median(hs)
    rows=[r for r in rows if r[1]-r[0]>5]
    while len(rows)>nrows:                                  # junta los trozos más cercanos
        i=min(range(len(rows)-1),key=lambda k:rows[k+1][0]-rows[k][1]); rows[i:i+2]=[[rows[i][0],rows[i+1][1]]]
    P=m.sum(1); Pd=md.sum(1)
    while len(rows)<nrows:
        i=max(range(len(rows)),key=lambda k:rows[k][1]-rows[k][0]); y0,y1=rows[i]; L=y1-y0
        c=y0+int(L*.2)+int(np.argmin(Pd[y0+int(L*.2):y0+int(L*.8)])); rows[i:i+1]=[[y0,c],[c,y1]]
    if len(rows)!=nrows: print('ROWS',path,len(rows),hs)
    if ncols is None:                                     # 6 u 8 cuadros: se cuentan en la fila con más huecos limpios
        y0,y1=rows[3]; lb,nn=nd.label(nd.binary_dilation(m[y0:y1],iterations=5)); ar=np.bincount(lb.ravel())[1:]
        cnt=int((ar>ar.max()*.25).sum()) if nn else 6
        ncols=8 if cnt>=7 else 6
    out=[]
    for (y0,y1) in rows[:nrows]:
        sub=m[y0:y1]; cols=segs(sub.sum(0),1,3)
        ws=[c[1]-c[0] for c in cols]
        cols=[c for c in cols if c[1]-c[0]>.2*max(ws)]
        if True:
            nc=ncols; sd=nd.binary_dilation(sub,iterations=3); cs=[c for c in segs(sd.sum(0),1,4) if c[1]-c[0]>sub.shape[1]*.03]
            if len(cs)>2:
                med=sorted(c[1]-c[0] for c in cs)[len(cs)//2]; i=0
                while i<len(cs)-1:
                    a,b=cs[i],cs[i+1]
                    if a[1]-a[0]<.7*med and b[1]-b[0]<.7*med and b[1]-a[0]<1.4*med: cs[i:i+2]=[[a[0],b[1]]]
                    else: i+=1
            if len(cs) in (5,6,8) and len(cs)!=ncols and ROWAUTO: nc=len(cs)
            if DEBUG: print('row',y0,len(cs),[c[1]-c[0] for c in cs])
            pj=sub.sum(0); xs=np.where(pj>0)[0]; x0,x1=xs[0],xs[-1]+1; W=(x1-x0)/nc
            B=[x0]+[int(x0+k*W-W*.3)+int(np.argmin(pj[int(x0+k*W-W*.3):int(x0+k*W+W*.3)])) for k in range(1,nc)]+[x1]
            cols=[[B[k],B[k+1]] for k in range(nc)]
        fr=[]
        for (x0,x1) in cols:
            mm=m[y0:y1,x0:x1]; ys=np.where(mm.any(1))[0]; xs=np.where(mm.any(0))[0]
            if len(ys)==0: fr.append(None); continue
            if BIG is None: fr.append(rgba[y0+ys[0]:y0+ys[-1]+1, x0+xs[0]:x0+xs[-1]+1]); continue
            c=BIG[F*(y0+ys[0]):F*(y0+ys[-1]+1), F*(x0+xs[0]):F*(x0+xs[-1]+1)].copy(); al=c[...,3]>30
            yy=np.where(al.any(1))[0]; xx=np.where(al.any(0))[0]; fr.append(c[yy[0]:yy[-1]+1, xx[0]:xx[-1]+1] if len(yy) else c)
        out.append(fr)
    return out
def pack(rows, maxh):
    for r in rows:
        for k in range(len(r)):
            if r[k] is None or r[k].shape[0]*r[k].shape[1]<50:
                nb=[r[j] for j in sorted(range(len(r)),key=lambda j:abs(j-k)) if r[j] is not None and r[j].shape[0]*r[j].shape[1]>=50]
                if nb: r[k]=nb[0]
    # scale: tallest cell across rows limited to maxh
    H=max(max(f.shape) for r in rows for f in r if f is not None)
    s=min(1,maxh/H)
    meta=[];imgs=[]
    for r in rows:
        cw=max(f.shape[1] for f in r if f is not None); ch=max(f.shape[0] for f in r if f is not None)
        cw2,ch2=max(1,round(cw*s)),max(1,round(ch*s))
        row=Image.new('RGBA',(cw2*len(r),ch2),(0,0,0,0))
        for k,f in enumerate(r):
            if f is None: continue
            im=Image.fromarray(f,'RGBA'); w,h=max(1,round(im.width*s)),max(1,round(im.height*s)); im=im.resize((w,h),Image.LANCZOS)
            row.alpha_composite(im,(k*cw2+(cw2-w)//2,(ch2-h)//2))
        imgs.append(row); meta.append([cw2,ch2])
    W=max(i.width for i in imgs); Ht=sum(i.height for i in imgs)
    sh=Image.new('RGBA',(W,Ht),(0,0,0,0)); y=0; M=[]
    for i,(cw,ch) in zip(imgs,meta): sh.alpha_composite(i,(0,y)); M.append([y,cw,ch,len(r)]); y+=ch
    return sh,M
if __name__=='__main__':
    J={}
    for arg in sys.argv[1:]:
        k,p=arg.split('=',1)
        nc=None
        if '@' in k: k,nc=k.split('@'); nc=int(nc)
        rows=proc(p,ncols=nc); sh,M=pack(rows,170); sh.save(f'/home/claude/w/out/bf_{k}.png',optimize=True); J[k]=M
        print(k,sh.size,[len([f for f in r if f is not None]) for r in rows])
    json.dump(J,open('/home/claude/w/out/meta.json','w'))
