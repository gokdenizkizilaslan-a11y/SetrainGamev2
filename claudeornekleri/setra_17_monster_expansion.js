/**
 * SETRA — 17 MONSTER EXPANSION
 * ------------------------------------------------------------
 * Prepared from the supplied claudeicinasset.js architecture sample.
 *
 * Contains:
 *   - 17 monster data records in the supplied travel monster schema
 *   - 17 original Canvas painter functions (procedural artwork)
 *   - painter registry and integration helpers
 *   - integration notes for the local AI/developer
 *
 * IMPORTANT INTEGRATION NOTE:
 * The supplied file is an architecture/sample file, not the real
 * public/js/travelEngine.js or content.js. Therefore this module uses
 * an explicit painter adapter signature:
 *
 *   painter(ctx, x, y, scale, timeSeconds, facing, state)
 *
 * Adapt the call site in the real travelEngine.js to this signature,
 * or wrap each painter to match the engine's existing signature.
 * Do not replace existing painters or overwrite the existing 28 monsters.
 *
 * All artwork is drawn procedurally. No external image assets are required.
 */

"use strict";

const SETRA_MONSTER_EXPANSION = (() => {
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const pulse = (t, speed = 1, phase = 0) => (Math.sin(t * speed + phase) + 1) * 0.5;
  const bob = (t, speed = 2, amount = 2, phase = 0) => Math.sin(t * speed + phase) * amount;

  function save(ctx, fn) {
    ctx.save();
    try { fn(); } finally { ctx.restore(); }
  }
  function ellipse(ctx, x, y, rx, ry, fill, stroke = null, lw = 1) {
    ctx.beginPath();
    ctx.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), 0, 0, TAU);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
  }
  function path(ctx, points, fill, stroke = null, lw = 1, close = true) {
    ctx.beginPath();
    points.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
    if (close) ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.lineJoin = "round"; ctx.stroke(); }
  }
  function line(ctx, points, color, lw = 1, cap = "round") {
    ctx.beginPath();
    points.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
    ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = cap; ctx.lineJoin = "round"; ctx.stroke();
  }
  function glow(ctx, x, y, r, color, alpha = .35) {
    const old = ctx.globalAlpha;
    ctx.globalAlpha = alpha;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color); g.addColorStop(1, "rgba(0,0,0,0)");
    ellipse(ctx, x, y, r, r, g);
    ctx.globalAlpha = old;
  }
  function shadow(ctx, rx, ry, alpha = .28) {
    ellipse(ctx, 0, 14, rx, ry, `rgba(0,0,0,${alpha})`);
  }
  function limb(ctx, points, width, color, hi = null) {
    line(ctx, points, color, width);
    if (hi) line(ctx, points.map(([x,y]) => [x - width*.18, y - width*.12]), hi, Math.max(1,width*.2));
  }
  function crystal(ctx, x, y, w, h, color, light) {
    path(ctx, [[x,y-h],[x+w*.48,y-h*.42],[x+w*.5,y+h],[x-w*.5,y+h*.62],[x-w*.45,y-h*.35]], color, "#d8fbff", .65);
    path(ctx, [[x,y-h],[x+w*.48,y-h*.42],[x,y+h*.05]], light);
  }
  function eye(ctx, x, y, color = "#f5ffb0", r = 1.7) {
    glow(ctx, x, y, 8, color, .55);
    ellipse(ctx, x, y, r*1.6, r, color);
    ellipse(ctx, x+.25, y, .45, r*.8, "#111018");
  }
  function root(ctx, x1, y1, x2, y2, color, w = 3) {
    line(ctx, [[x1,y1],[x1+(x2-x1)*.35,y1+(y2-y1)*.55],[x2,y2]], color, w);
  }

  // Every painter has its own silhouette and material language.
  const painters = {
    sporeling(ctx,x,y,s=1,t=0,f=1,state={}) {
      save(ctx,()=>{ ctx.translate(x,y+bob(t,3,1.5)); ctx.scale(s*f,s);
        shadow(ctx,12,5); glow(ctx,0,-11,20,"#b9ff6a",.16);
        ellipse(ctx,0,3,7,10,"#566d37","#263a26",1);
        path(ctx,[[-7,-7],[-9,-16],[-5,-23],[0,-26],[6,-23],[10,-16],[7,-7],[0,-5]],"#a6c76a","#415b32",1.2);
        ellipse(ctx,0,-19,10,5,"#c6df83","#718f45",1);
        for(let i=0;i<5;i++) ellipse(ctx,-6+i*3,-19-(i%2)*2,1.1,1.5,"#efffb0");
        limb(ctx,[[-4,8],[-6,14]],3,"#344a2a"); limb(ctx,[[4,8],[6,14]],3,"#344a2a");
        eye(ctx,-3,-11,"#eaff91",1); eye(ctx,3,-11,"#eaff91",1);
        for(let i=0;i<4;i++){ const a=t*1.4+i*1.57; glow(ctx,Math.cos(a)*12,-20+Math.sin(a)*7,4,"#baff78",.24); }
      });
    },
    briarHound(ctx,x,y,s=1,t=0,f=1,state={}) {
      save(ctx,()=>{ ctx.translate(x,y+bob(t,7,1)); ctx.scale(s*f,s);
        shadow(ctx,20,6); glow(ctx,7,-8,16,"#7dff55",.12);
        // four limbs and low canine torso
        limb(ctx,[[-10,1],[-14,9],[-17,13]],4,"#384b2d","#819c45");
        limb(ctx,[[8,1],[12,9],[15,13]],4,"#384b2d","#819c45");
        limb(ctx,[[-3,1],[-4,9],[-5,14]],3.5,"#405331");
        limb(ctx,[[5,1],[7,9],[8,14]],3.5,"#405331");
        ellipse(ctx,0,-3,16,8,"#526b36","#263a28",1.4);
        path(ctx,[[-12,-7],[-7,-13],[5,-12],[13,-7],[9,0],[-8,1]],"#6f8c43","#33452b",1);
        path(ctx,[[7,-8],[14,-13],[20,-12],[18,-6],[10,-4]],"#657e3e","#33452b",1);
        path(ctx,[[13,-13],[14,-20],[18,-14]],"#b0c96a","#435b32",.8);
        path(ctx,[[7,-12],[5,-19],[11,-14]],"#b0c96a","#435b32",.8);
        eye(ctx,16,-10,"#baff4b",1.8);
        for(let i=0;i<5;i++){ let xx=-9+i*5; path(ctx,[[xx,-9],[xx-2,-16],[xx+2,-12]],"#b7c86a","#506638",.7); }
        root(ctx,-13,-3,-22,-10,"#435a2d",2.5);
        root(ctx,-16,-2,-23,3,"#435a2d",2);
      });
    },
    myceliumOracle(ctx,x,y,s=1,t=0,f=1,state={}) {
      save(ctx,()=>{ ctx.translate(x,y+bob(t,1.8,2)); ctx.scale(s*f,s);
        shadow(ctx,26,8); glow(ctx,0,-17,39,"#a5ff8d",.24);
        for(let i=0;i<5;i++){ const a=t*.35+i*TAU/5; const px=Math.cos(a)*23, py=-22+Math.sin(a)*9;
          ellipse(ctx,px,py,2.3,2.3,"#d8ff9a"); }
        root(ctx,-9,2,-20,12,"#4c5636",5); root(ctx,9,2,20,12,"#4c5636",5);
        limb(ctx,[[-10,-5],[-18,3],[-22,10]],6,"#5d6840","#a3b86b");
        limb(ctx,[[10,-5],[18,3],[22,10]],6,"#5d6840","#a3b86b");
        ellipse(ctx,0,-3,13,17,"#667b4a","#283d2c",1.5);
        glow(ctx,0,-8,13,"#a9ff73",.55); ellipse(ctx,0,-8,5,7,"#d5ff9c");
        path(ctx,[[-18,-16],[-20,-28],[-13,-39],[-5,-34],[0,-43],[7,-34],[16,-37],[22,-26],[17,-15],[0,-12]],"#9abf68","#48643b",1.4);
        ellipse(ctx,0,-29,20,7,"#c4df85","#708e4a",1);
        for(let i=0;i<7;i++) ellipse(ctx,-14+i*4,-29-(i%2)*2,1.2,1.6,"#efffc2");
        for(let i=0;i<4;i++){ const a=t+i*1.57; const px=Math.cos(a)*29, py=-20+Math.sin(a)*12; glow(ctx,px,py,7,"#b6ff8a",.3); }
      });
    },
    scoriaCrawler(ctx,x,y,s=1,t=0,f=1,state={}) {
      save(ctx,()=>{ ctx.translate(x,y); ctx.scale(s*f,s); shadow(ctx,12,4);
        ellipse(ctx,0,1,11,6,"#202329","#090d12",1.4);
        path(ctx,[[-10,0],[-9,-7],[-4,-11],[3,-10],[10,-5],[11,1],[5,5],[-6,5]],"#34363b","#111318",1.3);
        path(ctx,[[-7,-5],[-4,-12],[0,-15],[5,-11],[8,-5],[2,-2]],"#4b4c50","#1b1d22",1);
        line(ctx,[[-5,-6],[-2,-9],[1,-6],[5,-9]],"#ff6b27",1.5);
        for(let i=0;i<3;i++){ limb(ctx,[[-7+i*7,3],[-10+i*8,8]],2,"#17191e"); }
        glow(ctx,1,-7,12,"#ff5422",.25); eye(ctx,5,-7,"#ffb347",1.2);
      });
    },
    furnaceHound(ctx,x,y,s=1,t=0,f=1,state={}) {
      save(ctx,()=>{ ctx.translate(x,y+bob(t,5,1.2)); ctx.scale(s*f,s); shadow(ctx,22,6);
        glow(ctx,3,-9,27,"#ff4d18",.23);
        for(let i=0;i<4;i++) limb(ctx,[[-11+i*7,0],[-12+i*7,8],[-14+i*7,13]],4,"#29272a","#ff6a2b");
        ellipse(ctx,0,-4,17,9,"#38353a","#171519",1.5);
        path(ctx,[[-14,-7],[-9,-15],[3,-16],[13,-9],[9,0],[-9,1]],"#4c4648","#171519",1.2);
        path(ctx,[[7,-10],[14,-17],[21,-15],[19,-8],[12,-4]],"#484144","#171519",1);
        path(ctx,[[13,-14],[12,-22],[17,-17],[20,-23],[21,-14]],"#ff7831","#8e321d",1);
        for(let i=0;i<6;i++){ const xx=-10+i*4; path(ctx,[[xx,-11],[xx-2,-19],[xx+2,-14]],"#ff8a3c","#7e301e",.8); }
        eye(ctx,17,-11,"#fff29b",2); line(ctx,[[17,-5],[22,-3],[17,-2]],"#ffb45c",1.4);
        glow(ctx,0,-2,12,"#ff5a22",.28);
      });
    },
    pyrewingMatriarch(ctx,x,y,s=1,t=0,f=1,state={}) {
      save(ctx,()=>{ ctx.translate(x,y+bob(t,2.2,3)); ctx.scale(s*f,s); shadow(ctx,28,7);
        glow(ctx,0,-20,42,"#ff5b19",.34);
        const flap=Math.sin(t*5)*5;
        path(ctx,[[-3,-19],[-27,-34-flap],[-35,-22-flap],[-20,-10],[-7,-8]],"#3b2525","#a94a2c",1.4);
        path(ctx,[[3,-19],[27,-34+flap],[35,-22+flap],[20,-10],[7,-8]],"#3b2525","#a94a2c",1.4);
        for(let i=0;i<4;i++){ line(ctx,[[-6,-19],[-27+i*5,-31-flap]],"#ff8a42",1.1); line(ctx,[[6,-19],[27-i*5,-31+flap]],"#ff8a42",1.1); }
        ellipse(ctx,0,-10,11,17,"#3a3030","#171519",1.5);
        glow(ctx,0,-12,12,"#ff6a22",.65); ellipse(ctx,0,-12,5,9,"#ffb64a");
        path(ctx,[[-7,-22],[-10,-31],[-4,-27],[0,-35],[4,-27],[10,-31],[7,-21]],"#5b3a34","#a85a36",1);
        path(ctx,[[5,-19],[14,-23],[18,-19],[12,-15]],"#5b3a34","#b35a35",1);
        eye(ctx,11,-20,"#fff3a0",1.8);
        for(let i=0;i<5;i++){ const a=t*2+i*1.25; glow(ctx,Math.cos(a)*25,-16+Math.sin(a)*13,5,"#ff9a36",.3); }
      });
    },
    rimeToad(ctx,x,y,s=1,t=0,f=1,state={}) {
      save(ctx,()=>{ ctx.translate(x,y+bob(t,3,1)); ctx.scale(s*f,s); shadow(ctx,17,5);
        limb(ctx,[[-9,4],[-15,9],[-16,12]],4,"#739ca7"); limb(ctx,[[9,4],[15,9],[16,12]],4,"#739ca7");
        ellipse(ctx,0,0,16,11,"#8ab8c4","#3d6575",1.4);
        path(ctx,[[-12,-3],[-9,-11],[-3,-13],[4,-12],[12,-5],[8,1],[-8,2]],"#b4dce0","#5e919d",1);
        for(let i=0;i<5;i++) crystal(ctx,-10+i*5,-7-(i%2)*2,4,8,"#8ed8e9","#e3ffff");
        eye(ctx,-6,-7,"#f5ffb8",1.7); eye(ctx,6,-7,"#f5ffb8",1.7);
        ellipse(ctx,0,-1,5,1.5,"#34505b");
        glow(ctx,0,-7,18,"#8ceaff",.16);
      });
    },
    borealStag(ctx,x,y,s=1,t=0,f=1,state={}) {
      save(ctx,()=>{ ctx.translate(x,y+bob(t,4,1)); ctx.scale(s*f,s); shadow(ctx,23,6);
        limb(ctx,[[-10,0],[-12,9],[-13,14]],4,"#829ba6","#d8f5ff");
        limb(ctx,[[8,0],[10,9],[11,14]],4,"#829ba6","#d8f5ff");
        limb(ctx,[[-3,1],[-4,9],[-5,14]],3.5,"#829ba6");
        limb(ctx,[[4,1],[5,9],[6,14]],3.5,"#829ba6");
        ellipse(ctx,0,-5,16,9,"#b9d3d9","#557987",1.2);
        path(ctx,[[7,-11],[13,-17],[19,-15],[20,-9],[13,-5]],"#c4dce2","#638896",1);
        path(ctx,[[12,-15],[10,-22],[13,-19],[17,-26],[17,-18],[22,-23],[20,-15]],"#9beaff","#e9ffff",1.1);
        path(ctx,[[-1,-12],[-5,-19],[-9,-24],[-7,-17],[-13,-21],[-9,-13]],"#9beaff","#e9ffff",1.1);
        eye(ctx,17,-12,"#baffff",1.8); glow(ctx,0,-9,23,"#83e8ff",.22);
        for(let i=0;i<4;i++) crystal(ctx,-10+i*6,-10,3,7,"#8fc8d8","#e8ffff");
      });
    },
    whiteoutSiren(ctx,x,y,s=1,t=0,f=1,state={}) {
      save(ctx,()=>{ ctx.translate(x,y+bob(t,2.4,3)); ctx.scale(s*f,s); shadow(ctx,15,5);
        glow(ctx,0,-17,31,"#9ceaff",.32);
        path(ctx,[[-5,-5],[-13,3],[-16,12],[-8,10],[-4,3],[0,14],[5,4],[12,12],[14,2],[5,-7]],"#a9dce8","#e6ffff",1);
        path(ctx,[[-7,-15],[-9,-24],[-4,-31],[4,-31],[9,-23],[6,-14],[0,-11]],"#c6eaf0","#5b9aa9",1);
        path(ctx,[[-8,-25],[-15,-20],[-13,-9],[-8,-13]],"#e6ffff","#8fc7d7",.8);
        path(ctx,[[8,-25],[15,-20],[13,-9],[8,-13]],"#e6ffff","#8fc7d7",.8);
        ellipse(ctx,0,-22,4,7,"#182d3c");
        glow(ctx,0,-22,8,"#b6faff",.5);
        for(let i=0;i<4;i++){ const a=t*1.4+i*TAU/4; crystal(ctx,Math.cos(a)*17,-19+Math.sin(a)*8,4,9,"#a8eaff","#f4ffff"); }
      });
    },
    borealDevourer(ctx,x,y,s=1,t=0,f=1,state={}) {
      save(ctx,()=>{ ctx.translate(x,y); ctx.scale(s*f,s); shadow(ctx,31,7);
        glow(ctx,0,-13,34,"#3bcaff",.28);
        // segmented serpentine body
        for(let i=0;i<5;i++){ const xx=-22+i*10, yy=3+Math.sin(t*2+i*.8)*2;
          ellipse(ctx,xx,yy,8-i*.45,6-i*.25,"#527f91","#173c52",1);
          path(ctx,[[xx-5,yy-3],[xx,yy-8],[xx+5,yy-3]],"#9bdced","#477d91",.8);
        }
        path(ctx,[[10,-5],[17,-14],[26,-15],[31,-9],[25,-2],[15,1]],"#83b6c7","#234c61",1.5);
        path(ctx,[[16,-13],[13,-22],[19,-17],[23,-25],[24,-15]],"#b5f3ff","#5ba2ba",1);
        path(ctx,[[24,-12],[31,-18],[29,-10]],"#b5f3ff","#5ba2ba",1);
        eye(ctx,26,-11,"#eaffff",2);
        for(let i=0;i<4;i++) crystal(ctx,-15+i*10,-5,4,10,"#72c7e5","#eaffff");
        glow(ctx,22,-7,12,"#5ee5ff",.55);
      });
    },
    mireling(ctx,x,y,s=1,t=0,f=1,state={}) {
      save(ctx,()=>{ ctx.translate(x,y+bob(t,4,1)); ctx.scale(s*f,s); shadow(ctx,10,4);
        ellipse(ctx,0,2,8,10,"#526b45","#263b2b",1);
        path(ctx,[[-7,-3],[-8,-10],[-3,-15],[4,-14],[9,-7],[6,0]],"#78905a","#344c35",1);
        ellipse(ctx,1,-9,5,4,"#1b2621");
        eye(ctx,-2,-10,"#d5ff69",1.2); eye(ctx,4,-10,"#d5ff69",1.2);
        line(ctx,[[-5,8],[-8,13]],"#384a32",2); line(ctx,[[5,8],[8,13]],"#384a32",2);
        for(let i=0;i<3;i++) ellipse(ctx,-4+i*4,3+i%2,1.3,2,"#b4c77b");
        glow(ctx,0,-9,12,"#9dff53",.14);
      });
    },
    corpseLantern(ctx,x,y,s=1,t=0,f=1,state={}) {
      save(ctx,()=>{ ctx.translate(x,y+bob(t,2,3)); ctx.scale(s*f,s); shadow(ctx,13,4);
        glow(ctx,0,-15,30,"#72ff83",.36);
        line(ctx,[[-5,-27],[-7,-34],[0,-37],[7,-34],[5,-27]],"#8eaa78",2);
        path(ctx,[[-10,-25],[-13,-13],[-9,-4],[0,0],[9,-4],[13,-13],[10,-25],[4,-29],[-4,-29]],"#58675b","#1c2b28",2);
        // rib cage lantern
        for(let i=0;i<4;i++) line(ctx,[[-8,-22+i*5],[8,-22+i*5]],"#b1c4a2",1.6);
        line(ctx,[[-7,-25],[-5,-3]],"#a9bea0",1.8); line(ctx,[[7,-25],[5,-3]],"#a9bea0",1.8);
        glow(ctx,0,-15,13,"#54ff70",.7); ellipse(ctx,0,-15,4,8,"#b5ff8a");
        line(ctx,[[-8,-4],[-13,4],[-17,8]],"#778b78",2);
        line(ctx,[[8,-4],[13,4],[17,8]],"#778b78",2);
        for(let i=0;i<3;i++){ const a=t+i*2.1; glow(ctx,Math.cos(a)*18,-14+Math.sin(a)*12,4,"#8dff9b",.22); }
      });
    },
    drownedMatron(ctx,x,y,s=1,t=0,f=1,state={}) {
      save(ctx,()=>{ ctx.translate(x,y+bob(t,1.5,1.4)); ctx.scale(s*f,s); shadow(ctx,29,7);
        glow(ctx,0,-15,35,"#6cff9c",.2);
        root(ctx,-9,-3,-25,8,"#354f3e",6); root(ctx,9,-3,25,8,"#354f3e",6);
        limb(ctx,[[-11,-7],[-20,0],[-25,10]],7,"#526e57","#a1bb7a");
        limb(ctx,[[11,-7],[20,0],[25,10]],7,"#526e57","#a1bb7a");
        ellipse(ctx,0,-5,16,17,"#617b63","#293e35",1.6);
        path(ctx,[[-13,-17],[-9,-27],[-3,-30],[0,-24],[4,-32],[9,-26],[14,-16],[7,-10],[-7,-10]],"#718d6d","#344b3c",1.2);
        path(ctx,[[-9,-27],[-14,-37],[-7,-32],[-2,-41],[2,-31],[10,-39],[8,-27]],"#526d4e","#9bb77b",1);
        eye(ctx,-5,-20,"#d8ff92",2); eye(ctx,5,-20,"#d8ff92",2);
        for(let i=0;i<4;i++) ellipse(ctx,-9+i*6,-3+i%2*3,2,3,"#9ac58a");
        line(ctx,[[-5,8],[-9,14]],"#394f3c",4); line(ctx,[[5,8],[9,14]],"#394f3c",4);
      });
    },
    graveMoth(ctx,x,y,s=1,t=0,f=1,state={}) {
      save(ctx,()=>{ ctx.translate(x,y+bob(t,4,2)); ctx.scale(s*f,s); shadow(ctx,12,4);
        const flap=Math.sin(t*9)*3;
        path(ctx,[[-2,-12],[-15,-25-flap],[-21,-20-flap],[-18,-7],[-5,-4]],"#282934","#77758b",1);
        path(ctx,[[2,-12],[15,-25+flap],[21,-20+flap],[18,-7],[5,-4]],"#282934","#77758b",1);
        path(ctx,[[-3,-11],[-11,-18-flap],[-14,-9],[-5,-5]],"#4d4a5b");
        path(ctx,[[3,-11],[11,-18+flap],[14,-9],[5,-5]],"#4d4a5b");
        ellipse(ctx,0,-8,3,11,"#b6b3a8","#363540",1);
        ellipse(ctx,0,-20,5,5,"#8c8b86","#30303a",1);
        eye(ctx,-2,-21,"#ff5d70",1.2); eye(ctx,2,-21,"#ff5d70",1.2);
        line(ctx,[[-2,-24],[-6,-29]],"#c4c0b4",1); line(ctx,[[2,-24],[6,-29]],"#c4c0b4",1);
        glow(ctx,0,-15,14,"#e34b6b",.16);
      });
    },
    chainboundPenitent(ctx,x,y,s=1,t=0,f=1,state={}) {
      save(ctx,()=>{ ctx.translate(x,y); ctx.scale(s*f,s); shadow(ctx,18,6);
        glow(ctx,0,-17,23,"#c04b57",.16);
        limb(ctx,[[-8,-6],[-13,2],[-15,12]],5,"#47434a","#92828a");
        limb(ctx,[[8,-6],[13,2],[15,12]],5,"#47434a","#92828a");
        path(ctx,[[-10,-18],[-12,-5],[-8,5],[0,8],[8,5],[12,-5],[10,-18],[5,-22],[-5,-22]],"#4d4b50","#1b1b22",1.7);
        path(ctx,[[-8,-20],[-7,-29],[0,-34],[8,-29],[9,-19],[4,-16],[-5,-16]],"#6b666c","#24232b",1.5);
        path(ctx,[[-6,-28],[-3,-33],[0,-29],[4,-34],[7,-27]],"#2a2830");
        glow(ctx,0,-24,9,"#a42f46",.25);
        // chains crossing torso and hanging from arms
        line(ctx,[[-12,-14],[0,-6],[12,-14],[16,-5],[13,5]],"#b2a9a0",2.2);
        line(ctx,[[12,-14],[0,-6],[-12,-14],[-16,-5],[-13,5]],"#716e70",1.5);
        for(let i=0;i<3;i++) ellipse(ctx,-2+i*2,-9+i*2,1.2,2,"#d2c9bd");
        line(ctx,[[-13,2],[-19,7],[-17,13]],"#9b9290",2);
        line(ctx,[[13,2],[19,7],[17,13]],"#9b9290",2);
      });
    },
    carrionAbomination(ctx,x,y,s=1,t=0,f=1,state={}) {
      save(ctx,()=>{ ctx.translate(x,y+bob(t,2.5,1)); ctx.scale(s*f,s); shadow(ctx,25,7);
        glow(ctx,0,-12,27,"#a84d48",.18);
        // four asymmetrical arms
        limb(ctx,[[-9,-8],[-19,-15],[-24,-7]],6,"#76524c","#b18a76");
        limb(ctx,[[9,-8],[19,-15],[24,-7]],6,"#76524c","#b18a76");
        limb(ctx,[[-8,0],[-18,7],[-23,13]],6,"#624b4a","#a98171");
        limb(ctx,[[8,0],[18,7],[23,13]],6,"#624b4a","#a98171");
        ellipse(ctx,0,-4,15,17,"#765b54","#302b30",1.5);
        path(ctx,[[-12,-13],[-10,-24],[-4,-29],[2,-25],[10,-28],[13,-16],[7,-9],[-7,-8]],"#8c7066","#42343a",1.4);
        path(ctx,[[-6,-27],[-10,-36],[-2,-31],[4,-38],[5,-28]],"#c2b2a0","#51434a",1);
        eye(ctx,-5,-20,"#ffcf77",1.8); eye(ctx,6,-20,"#ff5262",1.8);
        path(ctx,[[-5,-9],[0,-5],[5,-10],[3,-2],[0,1],[-4,-2]],"#2a1e25");
        for(let i=0;i<5;i++) line(ctx,[[-10+i*5,-2],[-8+i*5,5]],"#d0b7a3",1.2);
        line(ctx,[[-18,7],[-22,13],[-26,11]],"#d4c2b0",2);
        line(ctx,[[18,7],[22,13],[26,11]],"#d4c2b0",2);
      });
    },
    bellRinger(ctx,x,y,s=1,t=0,f=1,state={}) {
      save(ctx,()=>{ ctx.translate(x,y); ctx.scale(s*f,s); shadow(ctx,23,7);
        glow(ctx,0,-19,34,"#9c5a72",.2);
        // long executioner legs and torso
        limb(ctx,[[-6,-1],[-8,8],[-10,15]],5,"#38343c","#827780");
        limb(ctx,[[6,-1],[8,8],[10,15]],5,"#38343c","#827780");
        path(ctx,[[-10,-19],[-12,-5],[-8,2],[0,5],[8,2],[12,-5],[10,-19],[5,-23],[-5,-23]],"#393740","#15151c",1.7);
        path(ctx,[[-8,-22],[-9,-34],[-4,-40],[5,-39],[10,-31],[8,-21],[0,-18]],"#55515a","#1e1d25",1.5);
        path(ctx,[[-8,-34],[-13,-40],[-5,-38],[0,-44],[7,-38],[12,-41],[8,-32]],"#827a82","#34313a",1);
        eye(ctx,-4,-29,"#e74e6c",1.5); eye(ctx,4,-29,"#e74e6c",1.5);
        // bell on its back, suspended from iron yoke
        line(ctx,[[-7,-21],[-15,-29],[-20,-31]],"#aaa1a4",2.4);
        path(ctx,[[-22,-32],[-15,-36],[-7,-33],[-8,-20],[-14,-16],[-21,-20]],"#9a875f","#352f32",1.7);
        path(ctx,[[-20,-31],[-15,-33],[-10,-31],[-11,-22],[-16,-20],[-20,-23]],"#c0a875","#55483c",1);
        ellipse(ctx,-15,-17,2,3,"#d2b887");
        line(ctx,[[8,-8],[18,-3],[22,5]],"#9b9294",2);
        line(ctx,[[22,5],[26,10]],"#b3a9a7",2);
        // bell hammer
        line(ctx,[[22,10],[27,14]],"#6b5351",3);
        path(ctx,[[24,8],[31,7],[34,12],[30,17],[24,15]],"#b0a18b","#4a4142",1);
        for(let i=0;i<3;i++) line(ctx,[[-7+i*7,-14],[-5+i*7,-8]],"#9c9295",1.2);
      });
    }
  };


  // ------------------------------------------------------------
  // ART PASS II — high-detail silhouettes, layered materials,
  // stronger lighting, facial anatomy, armor, and biome particles.
  // These painters replace the first-pass prototypes above.
  // ------------------------------------------------------------
  const adv = {
    grad(ctx, x, y, r, stops) {
      const g = ctx.createRadialGradient(x-r*.28,y-r*.38,r*.05,x,y,r);
      stops.forEach((s,i)=>g.addColorStop(i/(stops.length-1),s));
      return g;
    },
    metal(ctx, pts, base, edge="#c5c0b5", dark="#171b20") {
      path(ctx,pts,base,dark,2);
      line(ctx,[pts[0],pts[1],pts[2]],edge,1.15);
    },
    plate(ctx, x,y,rx,ry,base,edge) {
      ellipse(ctx,x,y,rx,ry,adv.grad(ctx,x,y,Math.max(rx,ry)*1.5,[edge,base,"#11151a"]), "#10151a",1.8);
      ellipse(ctx,x-rx*.28,y-ry*.35,rx*.42,ry*.18,"rgba(255,255,255,.18)");
    },
    spike(ctx,x,y,len,angle,color,edge="#171b20",w=5) {
      save(ctx,()=>{ctx.translate(x,y);ctx.rotate(angle);
        path(ctx,[[-w,0],[0,-len],[w*.65,0],[0,2]],color,edge,1.2);
        line(ctx,[[-w*.25,-2],[0,-len+3]],"rgba(255,255,255,.42)",.8);
      });
    },
    rune(ctx,x,y,r,color,t=0) {
      save(ctx,()=>{ctx.translate(x,y);ctx.rotate(t*.15);
        ctx.strokeStyle=color;ctx.lineWidth=1.4;ctx.globalAlpha=.82;
        ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.stroke();
        path(ctx,[[0,-r*.72],[r*.5,0],[0,r*.72],[-r*.5,0]],null,color,1);
        line(ctx,[[0,-r*.45],[0,r*.45]],[color][0],1);
      });
    },
    particles(ctx,x,y,r,color,t,n=7) {
      for(let i=0;i<n;i++){const a=t*.45+i*TAU/n, rr=r*(.68+.18*Math.sin(t*1.7+i));
        glow(ctx,x+Math.cos(a)*rr,y+Math.sin(a)*rr*.55,4+(i%3),color,.28);
      }
    },
    eyePair(ctx,x,y,spread,color="#fff0a0",size=2.2) {
      eye(ctx,x-spread,y,color,size);eye(ctx,x+spread,y,color,size);
    },
    claw(ctx,x,y,dir,color="#b6a58b") {
      path(ctx,[[x,y],[x+dir*5,y+5],[x+dir*10,y+11],[x+dir*4,y+8]],color,"#17191c",1);
    }
  };
  function detailed(kind, ctx,x,y,s,t,f,state={}) {
    save(ctx,()=> {
      ctx.translate(x,y+bob(t,2.1,1.1));ctx.scale(s*f,s);
      const pulseGlow=(col,rad=36,yy=-24)=>glow(ctx,0,yy,rad,col,.32);
      const dark="#11151a";
      if(kind==="sporeling"){
        shadow(ctx,18,6);pulseGlow("#baff76",25,-22);
        // rooted, bulbous mushroom body
        path(ctx,[[-11,12],[-13,3],[-9,-9],[-7,-19],[0,-23],[8,-17],[12,-4],[10,12]],adv.grad(ctx,0,-4,24,["#e1f3a0","#779747","#263a27"]),dark,2);
        path(ctx,[[-15,-18],[-12,-30],[-4,-37],[5,-36],[14,-28],[16,-18],[8,-14],[-8,-14]],"#a9c76c","#31462e",2);
        ellipse(ctx,0,-27,16,5,"#d6e69a","#637c3f",1.2);
        for(let i=0;i<9;i++)ellipse(ctx,-12+i*3,-28-(i%2)*2,1.1,1.8,"#f5ffd0");
        adv.eyePair(ctx,0,-9,4,"#edff8c",1.8);
        for(let i=0;i<4;i++)adv.spike(ctx,-9+i*6,-13,8,(i-1.5)*.18,"#6c8c43");
        limb(ctx,[[-5,9],[-8,16],[-12,18]],3.5,"#394b2b");limb(ctx,[[5,9],[8,16],[12,18]],3.5,"#394b2b");
        adv.particles(ctx,0,-24,24,"#caff83",t,5);
      } else if(kind==="briarbound_hound"){
        shadow(ctx,29,7);pulseGlow("#9eff55",35,-15);
        // articulated four-legged thorn wolf
        limb(ctx,[[-16,-1],[-20,8],[-22,17]],6,"#39482c","#9eaa55");limb(ctx,[[14,-1],[18,8],[20,17]],6,"#39482c","#9eaa55");
        limb(ctx,[[-5,1],[-7,10],[-8,17]],5,"#3b4d2c","#87994b");limb(ctx,[[6,1],[8,10],[9,17]],5,"#3b4d2c","#87994b");
        adv.plate(ctx,-1,-6,22,12,"#607b3a","#a4bc63");
        path(ctx,[[-18,-9],[-13,-18],[3,-19],[17,-12],[12,-2],[-12,1]],"#82994b","#293c27",2);
        path(ctx,[[9,-15],[18,-22],[27,-18],[25,-9],[17,-5]],"#758d42","#263b28",2);
        path(ctx,[[20,-19],[19,-30],[25,-23],[29,-30],[28,-18]],"#c1d47a","#40552e",1.4);
        path(ctx,[[14,-19],[12,-27],[18,-22]],"#b6cb6d","#40552e",1);
        adv.spike(ctx,-10,-14,13,-.5,"#b9cc6b");adv.spike(ctx,-2,-17,15,-.15,"#b9cc6b");adv.spike(ctx,6,-16,12,.1,"#b9cc6b");
        eye(ctx,24,-13,"#d9ff5e",2.4);line(ctx,[[22,-5],[29,-3],[25,0]],"#d8d2a0",1.6);
        root(ctx,-17,-3,-29,-13,"#42582e",3);
      } else if(kind==="mycelium_oracle"){
        shadow(ctx,31,8);pulseGlow("#aaff83",53,-30);
        // ancient fungal shaman with crown canopy and staff-like limbs
        for(let i=0;i<6;i++){const a=i*TAU/6;adv.spike(ctx,Math.cos(a)*15,-26+Math.sin(a)*5,20+(i%2)*8,a,"#9ab866","#3a4b2c",6);}
        path(ctx,[[-17,-13],[-22,-30],[-14,-46],[-5,-39],[0,-53],[7,-40],[18,-46],[24,-28],[17,-12],[0,-7]],"#9bbd68","#344a30",2.2);
        ellipse(ctx,0,-30,23,8,"#d2e69a","#617b40",1.4);
        for(let i=0;i<10;i++)ellipse(ctx,-18+i*4,-31-(i%2)*2,1.5,2,"#f5ffd1");
        path(ctx,[[-13,8],[-15,-8],[-9,-19],[0,-22],[10,-15],[14,4],[8,16],[-8,16]],"#526b3b","#1e3327",2);
        adv.rune(ctx,0,-8,8,"#c6ff84",t);adv.eyePair(ctx,0,-16,4,"#d7ff9c",2);
        limb(ctx,[[-9,-5],[-22,4],[-27,15]],7,"#536a3b","#a7bc68");limb(ctx,[[9,-5],[22,4],[27,15]],7,"#536a3b","#a7bc68");
        for(let i=0;i<4;i++){root(ctx,-8+i*5,10,-15+i*10,21,"#485d34",3);}
        adv.particles(ctx,0,-30,38,"#baff86",t,9);
      } else if(kind==="scoria_crawler"){
        shadow(ctx,18,5);pulseGlow("#ff6026",22,-8);
        // low obsidian insect with segmented shell and molten seams
        for(let i=0;i<6;i++){const side=i<3?-1:1,j=i%3;limb(ctx,[[side*5,-1+j*2],[side*(14+j*2),5+j*4],[side*(18+j*2),10+j*4]],3.2,"#272a30","#66565a");}
        adv.plate(ctx,0,-5,15,9,"#35383e","#8a7770");
        path(ctx,[[-13,-7],[-11,-15],[-4,-19],[5,-17],[13,-10],[10,-2],[-9,1]],"#4a4a4e","#15171c",2);
        path(ctx,[[-8,-13],[-3,-21],[5,-20],[10,-12],[3,-7]],"#24282e","#77716e",1.3);
        line(ctx,[[-8,-10],[-4,-14],[0,-10],[5,-15],[9,-9]],"#ff6428",2.4);
        line(ctx,[[-3,-17],[0,-12],[5,-18]],"#ffb052",1.3);
        eye(ctx,8,-10,"#ffdf8a",1.8);adv.spike(ctx,-5,-14,9,-.35,"#5c5b60");adv.spike(ctx,2,-16,8,.1,"#5c5b60");
      } else if(kind==="furnace_hound"){
        shadow(ctx,30,7);pulseGlow("#ff4c1d",39,-13);
        for(let i=0;i<4;i++)limb(ctx,[[-13+i*8,0],[-15+i*8,10],[-17+i*8,18]],6,"#30292b","#e65b2c");
        adv.plate(ctx,0,-7,22,13,"#44383a","#9d5140");
        path(ctx,[[-19,-9],[-13,-22],[4,-24],[18,-14],[14,-2],[-12,2]],"#584448","#17171c",2.2);
        // furnace vents
        for(let i=0;i<5;i++){path(ctx,[[-11+i*5,-17],[-9+i*5,-25],[-6+i*5,-18]],"#ff7b36","#7b2c20",1);glow(ctx,-8+i*4,-20,6,"#ff5722",.45);}
        path(ctx,[[11,-16],[20,-24],[30,-19],[28,-9],[18,-5]],"#514044","#17171c",2);
        path(ctx,[[19,-21],[16,-34],[23,-27],[28,-35],[29,-20]],"#ff873e","#7b3022",1.5);
        eye(ctx,25,-15,"#fff1a1",2.5);adv.claw(ctx,18,-5,1,"#d5a47a");
        adv.spike(ctx,-12,-15,12,-.5,"#8c5140");adv.spike(ctx,-3,-19,14,-.2,"#8c5140");
      } else if(kind==="pyrewing_matriarch"){
        shadow(ctx,35,8);pulseGlow("#ff4a17",55,-26);
        const flap=Math.sin(t*4.2)*8;
        path(ctx,[[-5,-20],[-25,-39-flap],[-48,-44-flap],[-39,-25-flap],[-18,-8],[-5,-8]],"#4a2928","#bd5734",2);
        path(ctx,[[5,-20],[25,-39+flap],[48,-44+flap],[39,-25+flap],[18,-8],[5,-8]],"#4a2928","#bd5734",2);
        for(let i=0;i<5;i++){line(ctx,[[-7,-18],[-42+i*7,-40-flap]],"#ff9b4c",1.3);line(ctx,[[7,-18],[42-i*7,-40+flap]],"#ff9b4c",1.3);}
        path(ctx,[[-12,-16],[-15,-31],[-7,-43],[0,-35],[7,-44],[15,-30],[12,-13],[0,-5]],"#6a3430","#24191c",2);
        adv.plate(ctx,0,-12,13,19,"#8d3d2e","#f18b48");
        for(let i=0;i<4;i++)adv.spike(ctx,-9+i*6,-28,13+(i%2)*5,(i-1.5)*.25,"#f28b42","#54251f",4);
        glow(ctx,0,-13,13,"#ffb33d",.75);ellipse(ctx,0,-13,5,11,"#fff0a2");
        eye(ctx,9,-28,"#fff3ac",2.2);
        adv.particles(ctx,0,-23,43,"#ff8b38",t,10);
      } else if(kind==="rime_toad"){
        shadow(ctx,23,6);pulseGlow("#85eaff",30,-11);
        limb(ctx,[[-11,4],[-20,11],[-24,15]],7,"#719eae","#d9fbff");limb(ctx,[[11,4],[20,11],[24,15]],7,"#719eae","#d9fbff");
        adv.plate(ctx,0,-1,21,15,"#8dbcc8","#d9f7fa");
        path(ctx,[[-17,-5],[-14,-16],[-6,-21],[7,-20],[17,-11],[14,3],[-12,5]],"#a9d3da","#456f80",2);
        for(let i=0;i<7;i++)adv.spike(ctx,-15+i*5,-12-(i%2)*3,10+(i%3)*3,(i-3)*.12,"#b8eff4","#477b8a",3.5);
        adv.eyePair(ctx,0,-12,7,"#f5ffbd",2.1);
        line(ctx,[[-5,-3],[0,-1],[5,-3]],"#315565",1.7);
        for(let i=0;i<4;i++)ellipse(ctx,-10+i*7,2,2,1.4,"#d9ffff");
      } else if(kind==="boreal_stag"){
        shadow(ctx,31,7);pulseGlow("#8cecff",38,-20);
        // elegant quadruped with branching antlers
        limb(ctx,[[-13,-1],[-16,11],[-17,19]],5,"#839eaa","#e6ffff");limb(ctx,[[12,-1],[15,11],[16,19]],5,"#839eaa","#e6ffff");
        limb(ctx,[[-4,1],[-5,12],[-6,19]],4,"#839eaa");limb(ctx,[[5,1],[6,12],[7,19]],4,"#839eaa");
        adv.plate(ctx,-1,-8,20,11,"#a8cbd3","#e7ffff");
        path(ctx,[[10,-13],[19,-23],[29,-20],[31,-12],[22,-6],[12,-7]],"#c4e1e5","#537e8b",1.8);
        // forked crystalline antlers
        line(ctx,[[19,-20],[17,-34],[11,-41],[10,-49]],"#a5edff",3);line(ctx,[[15,-31],[6,-37],[4,-44]],"#a5edff",2.5);
        line(ctx,[[19,-34],[25,-40],[28,-47]],"#a5edff",2.5);line(ctx,[[22,-24],[30,-31],[34,-38]],"#a5edff",2.5);
        line(ctx,[[-4,-15],[-9,-29],[-15,-36],[-17,-45]],"#a5edff",3);line(ctx,[[-10,-30],[-3,-37],[-2,-44]],"#a5edff",2.5);
        adv.eyePair(ctx,23,-16,0,"#c8ffff",2.2);adv.particles(ctx,0,-23,35,"#9defff",t,7);
      } else if(kind==="whiteout_siren"){
        shadow(ctx,20,6);pulseGlow("#a8efff",42,-28);
        // spectral harpy with long veil-like wings
        path(ctx,[[-5,-16],[-19,-30],[-36,-39],[-29,-22],[-18,-10],[-8,-5]],"#d5f4f7","#76b8c8",1.6);
        path(ctx,[[5,-16],[19,-30],[36,-39],[29,-22],[18,-10],[8,-5]],"#d5f4f7","#76b8c8",1.6);
        for(let i=0;i<4;i++){line(ctx,[[-7,-15],[-31+i*6,-35]],"#f4ffff",1.2);line(ctx,[[7,-15],[31-i*6,-35]],"#f4ffff",1.2);}
        path(ctx,[[-8,-14],[-11,-28],[-7,-39],[0,-43],[8,-37],[10,-24],[6,-12],[0,-8]],"#c4e9ef","#477e8c",2);
        path(ctx,[[-7,-35],[-15,-30],[-12,-18],[-7,-22]],"#efffff","#85bfcd",1);path(ctx,[[7,-35],[15,-30],[12,-18],[7,-22]],"#efffff","#85bfcd",1);
        ellipse(ctx,0,-29,4,8,"#142d3a");glow(ctx,0,-29,11,"#b9ffff",.7);
        path(ctx,[[-5,-9],[-11,7],[-7,17],[0,10],[7,17],[11,7],[5,-9]],"#9bcbd7","#477e8c",1.5);
        adv.particles(ctx,0,-25,28,"#b6faff",t,8);
      } else if(kind==="boreal_devourer"){
        shadow(ctx,43,8);pulseGlow("#4bdfff",58,-18);
        // massive many-segment ice wyrm with plated back and horned skull
        for(let i=0;i<6;i++){let xx=-38+i*12, yy=3+Math.sin(t*2+i*.7)*2;
          adv.plate(ctx,xx,yy,9-i*.45,9-i*.35,i%2?"#426d80":"#5b899a","#b8f4ff");
          adv.spike(ctx,xx,yy-6,13+(i%2)*4,-.1,"#b8efff","#31586a",4);
        }
        path(ctx,[[23,-7],[31,-21],[44,-25],[54,-18],[51,-6],[38,0],[26,0]],"#5c8fa1","#173f54",2.2);
        path(ctx,[[34,-19],[31,-33],[39,-26],[46,-37],[47,-22]],"#baf5ff","#4d9bb5",1.5);
        path(ctx,[[48,-17],[60,-24],[56,-12]],"#baf5ff","#4d9bb5",1.5);
        eye(ctx,47,-17,"#f1ffff",3);line(ctx,[[45,-8],[53,-5],[47,-3]],"#163d4c",2);
        for(let i=0;i<4;i++)line(ctx,[[31+i*5,-8],[34+i*5,-3]],"#e8ffff",1.2);
        adv.particles(ctx,15,-16,55,"#75eaff",t,10);
      } else if(kind==="mireling"){
        shadow(ctx,14,5);pulseGlow("#a4ff52",24,-12);
        path(ctx,[[-10,10],[-13,0],[-9,-11],[-3,-18],[7,-16],[12,-6],[9,9],[0,13]],"#526c43","#1e3329",2);
        adv.plate(ctx,0,-7,12,10,"#819b5d","#b7ca7b");
        path(ctx,[[-8,-13],[-6,-21],[0,-24],[8,-18],[9,-10],[2,-8]],"#718b53","#273b2c",1.7);
        adv.eyePair(ctx,1,-16,4,"#dcff6c",1.7);
        line(ctx,[[-5,-6],[0,-4],[5,-6]],"#273b2d",1.3);
        for(let i=0;i<5;i++)ellipse(ctx,-7+i*3,3+(i%2)*2,1.4,2,"#c3d889");
        limb(ctx,[[-5,8],[-10,15],[-12,18]],3,"#33472f");limb(ctx,[[5,8],[10,15],[12,18]],3,"#33472f");
      } else if(kind==="corpse_lantern"){
        shadow(ctx,21,6);pulseGlow("#70ff8c",43,-28);
        // floating drowned corpse, exposed ribs surrounding a soul lantern
        line(ctx,[[-7,-34],[-9,-43],[0,-48],[9,-43],[7,-34]],"#a5b99a",2.5);
        path(ctx,[[-12,-31],[-18,-17],[-14,-4],[-7,7],[0,11],[8,5],[15,-7],[16,-23],[9,-34]],"#4b6257","#182923",2);
        path(ctx,[[-9,-34],[-11,-46],[-5,-53],[5,-52],[11,-43],[9,-30],[0,-26]],"#738276","#26372f",1.8);
        adv.eyePair(ctx,0,-42,4,"#b7ff9c",2.1);
        // rib cage arcs
        for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse(0,-15+i*5,11-i*.8,5,0,Math.PI,TAU);ctx.strokeStyle="#b7c6a7";ctx.lineWidth=1.6;ctx.stroke();}
        ellipse(ctx,0,-13,5,7,adv.grad(ctx,0,-13,10,["#eaffb1","#5eff80","rgba(20,90,49,.1)"]));
        line(ctx,[[-8,-22],[-15,-10],[-18,0]],"#a1b49b",3);line(ctx,[[8,-22],[15,-10],[18,0]],"#a1b49b",3);
        adv.particles(ctx,0,-17,30,"#83ff9b",t,8);
      } else if(kind==="drowned_matron"){
        shadow(ctx,38,9);pulseGlow("#70ff9a",58,-30);
        // regal drowned witch, crown of reeds, ragged aquatic mantle
        path(ctx,[[-14,-12],[-27,1],[-32,22],[-20,16],[-12,25],[-5,13],[0,27],[8,13],[20,22],[29,7],[15,-14]],"#40594b","#172b27",2);
        path(ctx,[[-12,-23],[-17,-42],[-8,-53],[0,-48],[9,-55],[17,-40],[12,-21],[0,-14]],"#718b70","#243a32",2);
        for(let i=0;i<7;i++)adv.spike(ctx,-15+i*5,-39,18+(i%3)*7,(i-3)*.17,"#9dbb78","#304638",4);
        adv.plate(ctx,0,-11,15,18,"#526f59","#a5c58c");
        adv.rune(ctx,0,-14,8,"#c5ff9b",t);adv.eyePair(ctx,0,-31,5,"#d9ff9e",2.3);
        for(let i=0;i<5;i++){let xx=-18+i*9;line(ctx,[[xx,-5],[xx+(i-2)*4,13],[xx+(i-2)*6,25]],"#8aa77a",2.4);}
        line(ctx,[[-10,-10],[-25,1],[-32,12]],"#819b72",5);line(ctx,[[10,-10],[25,1],[32,12]],"#819b72",5);
        adv.particles(ctx,0,-25,47,"#8cff9c",t,10);
      } else if(kind==="grave_moth"){
        shadow(ctx,18,5);pulseGlow("#e94c70",31,-15);
        const flap=Math.sin(t*5)*6;
        path(ctx,[[-4,-15],[-19,-33-flap],[-30,-26-flap],[-25,-10],[-9,-5]],"#343344","#11121c",1.8);
        path(ctx,[[4,-15],[19,-33+flap],[30,-26+flap],[25,-10],[9,-5]],"#343344","#11121c",1.8);
        for(let i=0;i<4;i++){line(ctx,[[-5,-15],[-26+i*5,-29-flap]],"#9b6a88",1);line(ctx,[[5,-15],[26-i*5,-29+flap]],"#9b6a88",1);}
        ellipse(ctx,0,-12,6,18,"#292934","#0c0d14",1.5);
        path(ctx,[[-5,-24],[-9,-34],[-3,-30],[0,-38],[4,-30],[9,-34],[5,-23]],"#66536b","#171520",1.4);
        adv.eyePair(ctx,0,-19,2,"#ff6b86",1.8);
        adv.particles(ctx,0,-15,25,"#e84e74",t,7);
      } else if(kind==="chainbound_penitent"){
        shadow(ctx,31,8);pulseGlow("#b6a7a1",32,-26);
        // armored executioner, chained shoulders and iron cage helmet
        limb(ctx,[[-11,-4],[-17,9],[-19,20]],8,"#48484b","#aaa19a");limb(ctx,[[11,-4],[17,9],[19,20]],8,"#48484b","#aaa19a");
        adv.plate(ctx,0,-11,18,20,"#4b4a50","#a49a91");
        adv.metal(ctx,[[-16,-23],[-12,-34],[0,-39],[13,-32],[17,-20],[8,-13],[-9,-13]],"#5e5b60","#c3b9ad","#17171d");
        for(let i=0;i<5;i++)line(ctx,[[-10+i*5,-36],[-10+i*5,-17]],"#a9a19b",1.4);
        line(ctx,[[-11,-29],[11,-29]],"#a9a19b",2);
        adv.eyePair(ctx,0,-27,4,"#f04c5c",2);
        // chain draped across torso
        for(let i=0;i<7;i++){let xx=-17+i*5.5, yy=-13+Math.sin(i*.8)*5;ellipse(ctx,xx,yy,3,2.1,"#b3a99e","#3a3738",1);}
        line(ctx,[[-14,-9],[-22,-1],[-18,8],[-8,13],[1,9],[10,15],[20,8]],"#b0a69c",2.5);
        adv.spike(ctx,-14,-21,12,-.5,"#77747a");adv.spike(ctx,14,-21,12,.5,"#77747a");
        adv.rune(ctx,0,-5,6,"#d1b2a3",t);
      } else if(kind==="carrion_abomination"){
        shadow(ctx,38,9);pulseGlow("#d75c45",47,-18);
        // asymmetric stitched brute with extra arm and exposed organs
        limb(ctx,[[-14,-7],[-27,0],[-34,16]],11,"#76564f","#b18a70");limb(ctx,[[14,-7],[26,3],[32,20]],13,"#694d49","#ad7c67");
        limb(ctx,[[8,0],[18,10],[20,22]],7,"#594747","#9e7564");
        adv.plate(ctx,0,-11,23,18,"#765b54","#b68a70");
        path(ctx,[[-20,-20],[-14,-35],[-3,-39],[7,-32],[19,-28],[21,-12],[10,-5],[-12,-5]],"#8a6a5e","#382b2b",2);
        path(ctx,[[-10,-29],[-6,-40],[2,-35],[9,-42],[15,-30],[7,-22],[-5,-21]],"#a17b68","#3e2d2c",1.6);
        adv.eyePair(ctx,4,-30,5,"#ffcf77",2.5);
        // stitches and dangling ribs
        for(let i=0;i<5;i++)line(ctx,[[-13+i*6,-20],[-10+i*6,-16]],"#d4b69b",1.3);
        line(ctx,[[-10,-7],[-7,1],[-3,5],[4,1],[9,-7]],"#d4b69b",2);
        ellipse(ctx,1,-9,7,5,"#a43e3b","#341e21",1.2);
        adv.spike(ctx,-16,-24,15,-.5,"#927263");adv.spike(ctx,0,-31,13,0,"#927263");
        adv.claw(ctx,31,14,1,"#c0a18b");adv.claw(ctx,-32,12,-1,"#c0a18b");
      } else if(kind==="the_bell_ringer"){
        shadow(ctx,38,9);pulseGlow("#e34d70",55,-30);
        // towering plague priest, iron reliquary and massive bell
        path(ctx,[[-17,-12],[-25,3],[-29,24],[-17,18],[-8,30],[0,18],[9,30],[18,18],[28,22],[24,2],[15,-15]],"#393841","#14151b",2.2);
        adv.plate(ctx,0,-16,16,20,"#514d58","#9d8990");
        path(ctx,[[-12,-29],[-14,-43],[-7,-53],[0,-48],[8,-54],[15,-41],[11,-27],[0,-20]],"#625963","#201c25",2);
        adv.eyePair(ctx,0,-39,4,"#ff597b",2.4);
        path(ctx,[[-10,-44],[-17,-53],[-8,-51],[0,-61],[8,-51],[17,-54],[10,-43]],"#8e7887","#342c37",1.5);
        // large detailed bronze funeral bell on left side
        line(ctx,[[-10,-25],[-22,-34],[-34,-36]],"#9f9690",3);
        path(ctx,[[-45,-38],[-39,-44],[-28,-42],[-25,-29],[-30,-19],[-41,-20]],"#9e8962","#302b2b",2);
        path(ctx,[[-42,-37],[-37,-41],[-31,-39],[-29,-29],[-34,-25],[-40,-27]],"#c2ad7e","#5d4b3b",1.2);
        ellipse(ctx,-35,-18,3,4,"#d9bd83","#4a3d32",1);
        adv.rune(ctx,-35,-32,5,"#f3d08c",t);
        line(ctx,[[10,-9],[22,0],[27,13]],"#a69a96",3);
        adv.metal(ctx,[[22,8],[31,5],[37,12],[32,19],[24,17]],"#a69a87","#e0d0b0","#393033");
        for(let i=0;i<4;i++)line(ctx,[[-10+i*6,-11],[-8+i*6,-4]],"#b1a5a4",1.4);
        adv.particles(ctx,-23,-31,38,"#ed6b85",t,9);
      }
    });
  }
  Object.assign(painters, {
    sporeling:(...a)=>detailed("sporeling",...a),
    briarHound:(...a)=>detailed("briarbound_hound",...a),
    myceliumOracle:(...a)=>detailed("mycelium_oracle",...a),
    scoriaCrawler:(...a)=>detailed("scoria_crawler",...a),
    furnaceHound:(...a)=>detailed("furnace_hound",...a),
    pyrewingMatriarch:(...a)=>detailed("pyrewing_matriarch",...a),
    rimeToad:(...a)=>detailed("rime_toad",...a),
    borealStag:(...a)=>detailed("boreal_stag",...a),
    whiteoutSiren:(...a)=>detailed("whiteout_siren",...a),
    borealDevourer:(...a)=>detailed("boreal_devourer",...a),
    mireling:(...a)=>detailed("mireling",...a),
    corpseLantern:(...a)=>detailed("corpse_lantern",...a),
    drownedMatron:(...a)=>detailed("drowned_matron",...a),
    graveMoth:(...a)=>detailed("grave_moth",...a),
    chainboundPenitent:(...a)=>detailed("chainbound_penitent",...a),
    carrionAbomination:(...a)=>detailed("carrion_abomination",...a),
    bellRinger:(...a)=>detailed("the_bell_ringer",...a)
  });

  const monsters = [
    {kind:"sporeling",name:"Sporeling",painter:"sporeling",element:"nature",weight:34,elite:false,hp:115,damage:17,speed:112,radius:11,aggroRange:205,attackCooldown:2.1,exp:18,gold:3,color:"#a6c76a",accent:"#eaff91",role:"weak_swarm",biome:"verdant",skills:[{id:"sporeling_cloud",kind:"nova",cd:8,power:.55,radius:54,windup:.65,color:"#baff78"}]},
    {kind:"briarbound_hound",name:"Briarbound Hound",painter:"briarHound",element:"nature",weight:17,elite:false,hp:330,damage:42,speed:174,radius:17,aggroRange:315,attackCooldown:1.65,exp:55,gold:9,color:"#526b36",accent:"#b0c96a",role:"fast_predator",biome:"verdant",skills:[{id:"briar_pounce",kind:"dash",cd:6.5,range:245,windup:.48,dist:145,power:1.2,radius:38}]},
    {kind:"mycelium_oracle",name:"Mycelium Oracle",painter:"myceliumOracle",element:"nature",weight:4,elite:true,hp:2450,damage:91,speed:82,radius:28,aggroRange:390,attackCooldown:2.2,exp:460,gold:95,color:"#667b4a",accent:"#d5ff9c",role:"elite_controller",biome:"verdant",skills:[{id:"oracle_spore_nova",kind:"nova",cd:9,power:1.15,radius:145,windup:1.05,color:"#a9ff73"},{id:"oracle_root_prison",kind:"nova",cd:13,power:.85,radius:105,windup:1.25,color:"#668b42"},{id:"oracle_spore_bolt",kind:"projectile",cd:3.8,power:1.05,range:340,speed:190,color:"#c6ff8a"}]},
    {kind:"scoria_crawler",name:"Scoria Crawler",painter:"scoriaCrawler",element:"fire",weight:32,elite:false,hp:130,damage:20,speed:105,radius:12,aggroRange:195,attackCooldown:2,exp:20,gold:4,color:"#34363b",accent:"#ff6b27",role:"weak_swarm",biome:"ashen",skills:[{id:"scoria_ember_spit",kind:"projectile",cd:4.5,power:.65,range:210,speed:155,color:"#ff6b27"}]},
    {kind:"furnace_hound",name:"Furnace Hound",painter:"furnaceHound",element:"fire",weight:14,elite:false,hp:510,damage:61,speed:148,radius:20,aggroRange:330,attackCooldown:1.8,exp:82,gold:14,color:"#4c4648",accent:"#ff8a3c",role:"heavy_predator",biome:"ashen",skills:[{id:"furnace_charge",kind:"dash",cd:7,range:260,windup:.7,dist:155,power:1.35,radius:48},{id:"furnace_bite",kind:"arc",cd:3.2,power:1.1,radius:75,arc:1.4,color:"#ff7831"}]},
    {kind:"pyrewing_matriarch",name:"Pyrewing Matriarch",painter:"pyrewingMatriarch",element:"fire",weight:3,elite:true,hp:3100,damage:105,speed:112,radius:29,aggroRange:430,attackCooldown:2.1,exp:590,gold:125,color:"#3b2525",accent:"#ffb64a",role:"elite_aerial_boss",biome:"ashen",skills:[{id:"pyre_meteor_rain",kind:"nova",cd:12,power:1.35,radius:175,windup:1.4,color:"#ff7831"},{id:"pyre_infernal_dive",kind:"dash",cd:8,range:300,windup:.9,dist:210,power:1.55,radius:62},{id:"pyre_flame_cyclone",kind:"nova",cd:15,power:1.1,radius:125,windup:1.1,color:"#ff9a36"}]},
    {kind:"rime_toad",name:"Rime Toad",painter:"rimeToad",element:"ice",weight:30,elite:false,hp:155,damage:23,speed:86,radius:15,aggroRange:205,attackCooldown:2.25,exp:23,gold:4,color:"#8ab8c4",accent:"#e3ffff",role:"weak_ranged",biome:"frost",skills:[{id:"rime_frost_glob",kind:"projectile",cd:5,power:.72,range:220,speed:135,color:"#9ceaff"}]},
    {kind:"boreal_stag",name:"Boreal Stag",painter:"borealStag",element:"ice",weight:13,elite:false,hp:620,damage:68,speed:162,radius:21,aggroRange:350,attackCooldown:1.9,exp:95,gold:16,color:"#b9d3d9",accent:"#9beaff",role:"heavy_charger",biome:"frost",skills:[{id:"stag_crystal_charge",kind:"dash",cd:7,range:275,windup:.75,dist:175,power:1.4,radius:50},{id:"stag_shard_burst",kind:"nova",cd:9,power:.9,radius:95,windup:.8,color:"#9beaff"}]},
    {kind:"whiteout_siren",name:"Whiteout Siren",painter:"whiteoutSiren",element:"ice",weight:8,elite:false,hp:410,damage:57,speed:118,radius:16,aggroRange:380,attackCooldown:2.3,exp:88,gold:15,color:"#c6eaf0",accent:"#b6faff",role:"rare_flying_caster",biome:"frost",skills:[{id:"siren_winter_scream",kind:"nova",cd:10,power:1.05,radius:125,windup:1.15,color:"#b6faff"},{id:"siren_ice_shard",kind:"projectile",cd:3.6,power:.9,range:330,speed:205,color:"#a8eaff"}]},
    {kind:"boreal_devourer",name:"Boreal Devourer",painter:"borealDevourer",element:"ice",weight:3,elite:true,hp:3650,damage:112,speed:96,radius:31,aggroRange:440,attackCooldown:2.15,exp:650,gold:140,color:"#527f91",accent:"#b5f3ff",role:"elite_serpent_boss",biome:"frost",skills:[{id:"devourer_glacial_breath",kind:"arc",cd:8,power:1.35,radius:190,arc:1.1,color:"#5ee5ff"},{id:"devourer_ground_shatter",kind:"nova",cd:12,power:1.25,radius:155,windup:1.25,color:"#72c7e5"},{id:"devourer_icefall",kind:"projectile",cd:4,power:1.05,range:380,speed:175,color:"#b5f3ff"}]},
    {kind:"mireling",name:"Mireling",painter:"mireling",element:"poison",weight:35,elite:false,hp:120,damage:19,speed:120,radius:10,aggroRange:190,attackCooldown:1.9,exp:19,gold:3,color:"#78905a",accent:"#d5ff69",role:"weak_parasite",biome:"swamp",skills:[{id:"mireling_leech_bite",kind:"dash",cd:5.5,range:120,windup:.35,dist:65,power:.8,radius:22}]},
    {kind:"corpse_lantern",name:"Corpse Lantern",painter:"corpseLantern",element:"poison",weight:9,elite:false,hp:390,damage:54,speed:92,radius:17,aggroRange:360,attackCooldown:2.15,exp:85,gold:15,color:"#58675b",accent:"#8dff9b",role:"rare_floating_trickster",biome:"swamp",skills:[{id:"lantern_spectral_burst",kind:"nova",cd:9,power:1.05,radius:100,windup:.9,color:"#54ff70"},{id:"lantern_false_light",kind:"projectile",cd:4.2,power:.85,range:300,speed:165,color:"#8dff9b"}]},
    {kind:"drowned_matron",name:"Drowned Matron",painter:"drownedMatron",element:"poison",weight:3,elite:true,hp:3300,damage:101,speed:78,radius:30,aggroRange:410,attackCooldown:2.35,exp:610,gold:130,color:"#617b63",accent:"#d8ff92",role:"elite_swamp_boss",biome:"swamp",skills:[{id:"matron_mire_wave",kind:"nova",cd:10,power:1.2,radius:165,windup:1.1,color:"#6cff9c"},{id:"matron_grasping_tendrils",kind:"arc",cd:7,power:1.15,radius:145,arc:1.8,color:"#9ac58a"},{id:"matron_rotting_flood",kind:"nova",cd:15,power:1.4,radius:205,windup:1.6,color:"#526d4e"}]},
    {kind:"grave_moth",name:"Grave Moth",painter:"graveMoth",element:"dark",weight:34,elite:false,hp:125,damage:20,speed:145,radius:12,aggroRange:240,attackCooldown:1.8,exp:21,gold:4,color:"#282934",accent:"#ff5d70",role:"weak_flying",biome:"cursed",skills:[{id:"moth_death_dust",kind:"nova",cd:8,power:.6,radius:65,windup:.55,color:"#e34b6b"}]},
    {kind:"chainbound_penitent",name:"Chainbound Penitent",painter:"chainboundPenitent",element:"dark",weight:14,elite:false,hp:690,damage:74,speed:88,radius:22,aggroRange:300,attackCooldown:2.05,exp:110,gold:19,color:"#4d4b50",accent:"#b2a9a0",role:"heavy_undead",biome:"cursed",skills:[{id:"penitent_chain_lash",kind:"arc",cd:5.5,power:1.25,radius:115,arc:1.5,color:"#b2a9a0"},{id:"penitent_iron_punishment",kind:"dash",cd:9,range:185,windup:.85,dist:110,power:1.35,radius:45}]},
    {kind:"carrion_abomination",name:"Carrion Abomination",painter:"carrionAbomination",element:"dark",weight:7,elite:false,hp:980,damage:89,speed:72,radius:25,aggroRange:315,attackCooldown:2.2,exp:155,gold:26,color:"#765b54",accent:"#ffcf77",role:"powerful_abomination",biome:"cursed",skills:[{id:"abomination_carrion_slam",kind:"nova",cd:8,power:1.35,radius:115,windup:1.0,color:"#a84d48"},{id:"abomination_cleaving_arms",kind:"arc",cd:4.5,power:1.2,radius:105,arc:2.1,color:"#c2b2a0"}]},
    {kind:"the_bell_ringer",name:"The Bell-Ringer",painter:"bellRinger",element:"dark",weight:3,elite:true,hp:3900,damage:118,speed:82,radius:29,aggroRange:430,attackCooldown:2.3,exp:720,gold:155,color:"#393740",accent:"#e74e6c",role:"elite_summoner_boss",biome:"cursed",skills:[{id:"bell_funeral_toll",kind:"nova",cd:11,power:1.25,radius:175,windup:1.25,color:"#9c5a72"},{id:"bell_grave_summoning",kind:"nova",cd:17,power:.75,radius:135,windup:1.5,color:"#e74e6c"},{id:"bell_resonance_wave",kind:"arc",cd:6,power:1.1,radius:165,arc:2.5,color:"#b0a18b"}]}
  ];

  function getMonster(kind) {
    return monsters.find(m => m.kind === kind) || null;
  }
  function getPainter(name) {
    return painters[name] || null;
  }
  function draw(kind, ctx, x, y, scale = 1, timeSeconds = 0, facing = 1, state = {}) {
    const monster = getMonster(kind);
    if (!monster) return false;
    const painter = painters[monster.painter];
    if (!painter) return false;
    painter(ctx, x, y, scale, timeSeconds, facing < 0 ? -1 : 1, state);
    return true;
  }
  function addToBiomeArrays(travelBiomes) {
    // Returns a new object; does not mutate the supplied biome arrays.
    const next = { ...travelBiomes };
    for (const monster of monsters) {
      const biome = next[monster.biome];
      if (!biome || !Array.isArray(biome.monsters)) {
        throw new Error(`SETRA expansion: missing travelBiomes.${monster.biome}.monsters`);
      }
      if (biome.monsters.some(m => m.kind === monster.kind)) {
        throw new Error(`SETRA expansion: duplicate monster kind "${monster.kind}"`);
      }
      next[monster.biome] = { ...biome, monsters: [...biome.monsters, monster] };
    }
    return next;
  }
  function validate(existingBiomes) {
    const kinds = new Set();
    const errors = [];
    for (const m of monsters) {
      if (kinds.has(m.kind)) errors.push(`Duplicate new kind: ${m.kind}`);
      kinds.add(m.kind);
      if (!painters[m.painter]) errors.push(`Missing painter: ${m.painter}`);
      if (!m.skills.length) errors.push(`No skills: ${m.kind}`);
      if (m.hp <= 0 || m.damage <= 0 || m.radius <= 0) errors.push(`Invalid combat stats: ${m.kind}`);
      if (existingBiomes && existingBiomes[m.biome] &&
          existingBiomes[m.biome].monsters.some(old => old.kind === m.kind)) {
        errors.push(`Kind already exists in game: ${m.kind}`);
      }
    }
    return { ok: errors.length === 0, added: monsters.length, errors };
  }

  return Object.freeze({
    monsters,
    painters,
    getMonster,
    getPainter,
    draw,
    addToBiomeArrays,
    validate,
    painterSignature: "painter(ctx, x, y, scale, timeSeconds, facing, state)"
  });
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = SETRA_MONSTER_EXPANSION;
}
