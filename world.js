// Minimon - World/Maps (12 overworld + 21 interiors = 33 total)
const MAP_COUNT=33;

function makeMap(w,h,name,encRate){
  return{width:w,height:h,name,encRate:encRate!==undefined?encRate:0.15,tiles:new Int32Array(w*h),npcs:[],signs:[],doors:[],encTable:[]};
}
function setT(m,x,y,t){if(x>=0&&x<m.width&&y>=0&&y<m.height)m.tiles[y*m.width+x]=t;}
function getT(m,x,y){return(x>=0&&x<m.width&&y>=0&&y<m.height)?m.tiles[y*m.width+x]:TILE_WALL;}
function walkable(m,x,y){return WALKABLE.has(getT(m,x,y));}
function encTile(m,x,y){return ENCOUNTER_TILES.has(getT(m,x,y));}
function getEnc(m){
  if(!m.encTable.length)return null;
  if(Math.random()<m.encRate)return m.encTable[Math.floor(Math.random()*m.encTable.length)];
  return null;
}
function fillRect(m,x1,y1,x2,y2,t){for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++)setT(m,x,y,t);}
function fillBorder(m,t){for(let x=0;x<m.width;x++){setT(m,x,0,t);setT(m,x,m.height-1,t);}for(let y=0;y<m.height;y++){setT(m,0,y,t);setT(m,m.width-1,y,t);}}
function placeBuilding(m, bx, by, bw, bh, doorOff, topTile){
  // bw 4-5, bh 3-4, doorOff 1..bw-2
  for(let x=bx;x<bx+bw;x++){ setT(m,x,by,TILE_ROOF); setT(m,x,by+bh-1,TILE_WALL); }
  for(let y=by;y<by+bh;y++){ setT(m,bx,y,TILE_WALL); setT(m,bx+bw-1,y,TILE_WALL); }
  for(let x=bx+1;x<bx+bw-1;x++) for(let y=by+1;y<by+bh-1;y++) setT(m,x,y,TILE_GROUND);
  if(topTile!==null) setT(m,bx+1,by+1,topTile);
  const dx=bx+doorOff, dy=by+bh-1; setT(m,dx,dy,TILE_DOOR); return {doorX:dx, doorY:dy};
}
function decoFlowers(m, pts){ for(const [x,y] of pts){ if(getT(m,x,y)===TILE_GRASS) setT(m,x,y,TILE_TGRASS); } }
function pathWithBorder(m, x1,y1,x2,y2){
  fillRect(m,x1,y1,x2,y2,TILE_PATH);
  // add grass border detail - leave as path, surrounding stays grass
}

// Seeded random for map generation
let _seed=12345;
function srand(s){_seed=s;}
function sRand(){_seed=(_seed*1103515245+12345)&0x7fffffff;return _seed/0x7fffffff;}

function createStartingTown(){
  const m=makeMap(20,20,"Starter Village",0.0);
  // Base: grass + tree border with openings
  for(let y=0;y<20;y++) for(let x=0;x<20;x++) setT(m,x,y,TILE_GRASS);
  fillBorder(m,TILE_TREE);
  // Openings for path south
  setT(m,10,19,TILE_PATH); setT(m,11,19,TILE_PATH);
  setT(m,10,0,TILE_TREE); setT(m,11,0,TILE_TREE);
  // Town plaza - detailed paved area with border
  fillRect(m,2,2,17,17,TILE_GRASS);
  fillRect(m,5,7,15,16,TILE_PATH);
  // Cobble path detailing - vertical spine
  for(let y=7;y<=16;y++){ setT(m,10,y,TILE_PATH); setT(m,11,y,TILE_PATH); }
  for(let x=5;x<=15;x++){ setT(m,x,7,TILE_PATH); setT(m,x,12,TILE_PATH); }
  // Decorative trees clusters (like Pokemon towns)
  const trees=[[3,3],[4,3],[3,4],[16,3],[16,4],[15,3],[3,16],[4,16],[3,15],[16,16],[15,16],[16,15],[2,8],[2,9],[17,8],[17,9],[6,3],[7,3],[12,3],[13,3]];
  for(const [x,y] of trees) setT(m,x,y,TILE_TREE);
  // Flower beds
  decoFlowers(m,[[6,8],[7,8],[13,8],[14,8],[6,11],[7,11],[13,11],[14,11],[9,13],[12,13],[5,14],[6,14],[14,14],[15,14]]);
  // Pond / water feature top
  setT(m,5,5,TILE_WATER); setT(m,6,5,TILE_WATER); setT(m,5,6,TILE_WATER);
  setT(m,14,5,TILE_WATER); setT(m,15,5,TILE_WATER); setT(m,15,6,TILE_WATER);
  // Fences using WALL low
  for(let x=5;x<=9;x++) setT(m,x,6,TILE_WALL);
  for(let x=12;x<=15;x++) setT(m,x,6,TILE_WALL);
  // Buildings - properly sized Pokemon style
  const pc = placeBuilding(m, 6, 8, 4, 4, 2, TILE_HEAL); // Pokemon Center at left
  const mart = placeBuilding(m, 13, 8, 4, 4, 1, TILE_SHOP); // Mart at right
  const lab = placeBuilding(m, 6, 13, 4, 3, 1, TILE_GYM); // Lab (uses GYM tile as lab)
  const house = placeBuilding(m, 13, 13, 4, 3, 2, TILE_SIGN); // Rival house
  // Sign post
  setT(m,11,6,TILE_SIGN); m.signs.push({x:11,y:6,text:"Starter Village - Where dreams begin!"});
  // Lab sign
  setT(m,8,12,TILE_SIGN); m.signs.push({x:8,y:12,text:"Prof. Sage's Lab"});
  // NPCs - placed logically outside/inside town
  m.npcs.push({x:10,y:10,type:"professor",name:"Prof. Sage",dialog:["I'm Prof. Sage!","Good to see you, {name}!","Welcome to the world of Minimon!","Choose your partner wisely!","Your neighbor Luna's house is east!"],facing:"down"});
  m.npcs.push({x:11,y:9,type:"healer",name:"Nurse Joy",dialog:["Welcome, {name}!","Let me heal your Minis!","Visit the Center anytime!"],facing:"down"});
  m.npcs.push({x:15,y:10,type:"talker",name:"Rival's Mom",dialog:["My daughter Luna is out training.","She'll be your rival, {name}!","Her house is the one with the red roof!"],facing:"left"});
  m.npcs.push({x:7,y:10,type:"item_giver",name:"Kind Old Man",dialog:["I don't battle anymore, {name}.","But I have this for you!","Take these Potions for Route 1!"],facing:"right",give_item:I_POTION,give_count:5,gave_item:false});
  m.npcs.push({x:9,y:7,type:"giver",name:"Wandering Sage",dialog:["I've traveled far, {name}.","Here, take this TM!","Use it well on Route 1!"],facing:"down",give_item:I_TM_BITE,give_count:1,gave_item:false});
  m.npcs.push({x:14,y:7,type:"talker",name:"Villager",dialog:["This town is peaceful, {name}.","The pond was built last year!"],facing:"down"});
  m.npcs.push({x:7,y:15,type:"talker",name:"Fisherman",dialog:["I love fishing, {name}!","Have you seen the Water Minis?","The pond has some!"]});
  m.npcs.push({x:11,y:17,type:"talker",name:"Gate Guard",dialog:["South is Route 1, {name}!","Catch Minis in the tall grass!","Heed Prof. Sage's warning!"]});
  // Doors - correctly mapped to interiors
  m.doors.push({x:pc.doorX,y:pc.doorY,dest:12,destX:5,destY:8});
  m.doors.push({x:mart.doorX,y:mart.doorY,dest:13,destX:5,destY:8});
  m.doors.push({x:lab.doorX,y:lab.doorY,dest:14,destX:4,destY:6});
  m.doors.push({x:house.doorX,y:house.doorY,dest:14,destX:4,destY:6});
  // Fix house door to correct interior slot 14 (shared for now, rival house uses same map but that's fine for progression)
  // Add second door for lab distinct interior - reuse 14 but we'll create separate 14 already
  // Route 1 south exit - clearly marked
  setT(m,10,18,TILE_DOOR); setT(m,11,18,TILE_DOOR);
  m.doors.push({x:10,y:18,dest:1,destX:10,destY:1});
  m.doors.push({x:11,y:18,dest:1,destX:11,destY:1});
  // South path continues
  setT(m,10,17,TILE_PATH); setT(m,11,17,TILE_PATH);
  return m;
}

function createRoute1(){
  srand(42);
  const m=makeMap(20,20,"Route 1",0.12);
  fillBorder(m,TILE_TREE);
  // OpenINGS
  setT(m,10,0,TILE_PATH); setT(m,11,0,TILE_PATH);
  setT(m,10,19,TILE_PATH); setT(m,11,19,TILE_PATH);
  // Base grass field
  for(let y=1;y<19;y++) for(let x=1;x<19;x++) setT(m,x,y,sRand()<0.35?TILE_TGRASS:TILE_GRASS);
  // Path winding - Pokemon style
  for(let y=0;y<20;y++){ setT(m,10,y,TILE_PATH); setT(m,11,y,TILE_PATH); }
  // Horizontal branch east-west for trainers
  for(let x=4;x<=16;x++){ setT(m,x,10,TILE_PATH); setT(m,x,11,TILE_PATH); }
  // Clear tall grass from path
  for(let y=1;y<19;y++) for(let x=10;x<=11;x++) if(sRand()<0.9) setT(m,x,y,TILE_PATH);
  for(let x=4;x<=16;x++) for(let y=10;y<=11;y++) setT(m,x,y,TILE_PATH);
  // Trees lining path + clusters
  const treeSpots=[[3,3],[4,4],[15,3],[16,5],[3,15],[4,16],[15,15],[16,16],[7,6],[14,7],[6,14],[13,14],[3,9],[17,9],[3,12],[17,12]];
  for(const [x,y] of treeSpots) setT(m,x,y,TILE_TREE);
  // Small ponds
  setT(m,5,5,TILE_WATER); setT(m,6,5,TILE_WATER); setT(m,6,6,TILE_WATER);
  setT(m,14,5,TILE_WATER); setT(m,15,5,TILE_WATER);
  setT(m,6,15,TILE_WATER); setT(m,5,15,TILE_WATER);
  // Flowers
  decoFlowers(m,[[9,4],[12,4],[4,8],[5,8],[15,8],[16,8],[4,13],[5,13],[15,13],[16,13],[9,15],[12,15]]);
  // Signs
  setT(m,9,1,TILE_SIGN); m.signs.push({x:9,y:1,text:"Route 1 - Starter Village -> Ember Town"});
  setT(m,12,18,TILE_SIGN); m.signs.push({x:12,y:18,text:"Ember Town ahead!"});
  // Fence sections near north/south gates
  for(let x=8;x<=13;x++){ if(x!==10&&x!==11){ setT(m,x,0,TILE_WALL); setT(m,x,19,TILE_WALL); } }
  // Doors - north to Starter Village, south to Ember Town
  setT(m,10,0,TILE_DOOR); setT(m,11,0,TILE_DOOR);
  m.doors.push({x:10,y:0,dest:0,destX:10,destY:17});
  m.doors.push({x:11,y:0,dest:0,destX:11,destY:17});
  setT(m,10,19,TILE_DOOR); setT(m,11,19,TILE_DOOR);
  m.doors.push({x:10,y:19,dest:2,destX:10,destY:1});
  m.doors.push({x:11,y:19,dest:2,destX:11,destY:1});
  // Trainers positioned to block/face path
  m.npcs.push({x:7,y:9,type:"trainer",name:"Bug Catcher Tim",dialog:["My bugs are strong!","Let's battle!","I caught them in the tall grass!"],facing:"right",defeated:false,party:[[7,3],[7,3]],rematchParty:[[7,18],[91,17],[7,20]],rematchDialog:["My bugs evolved!","Let's go again!"],aiLevel:AI_ROOKIE});
  m.npcs.push({x:15,y:12,type:"trainer",name:"Youngster Joey",dialog:["I like shorts!","They're comfy and easy to wear!","And great for running!"],facing:"left",defeated:false,party:[[9,4],[11,4]],rematchParty:[[10,20],[12,19],[51,18]],rematchDialog:["I trained hard!","Battle me again!"],aiLevel:AI_TRAINER});
  m.npcs.push({x:10,y:5,type:"rival",name:"Luna",dialog:["So we meet again, {name}!","I was waiting for you!","Let me see how much you've grown!"],facing:"down",defeated:false,rival_enc:1,rival_party:true});
  // Helper NPC
  m.npcs.push({x:12,y:8,type:"talker",name:"Route Guide",dialog:["Tip: Walk in tall grass to find Minis!","The path leads south to Ember Town!"],facing:"down"});
  m.encTable=[[7,3],[9,3],[13,3],[15,3],[17,3],[23,3],[91,3],[95,3]];
  return m;
}

function createEmberTown(){
  const m=makeMap(20,20,"Ember Town",0.0);
  for(let y=0;y<20;y++) for(let x=0;x<20;x++) setT(m,x,y,TILE_GRASS);
  fillBorder(m,TILE_TREE);
  setT(m,10,0,TILE_PATH); setT(m,11,0,TILE_PATH); setT(m,10,19,TILE_PATH); setT(m,11,19,TILE_PATH);
  fillRect(m,3,3,17,17,TILE_PATH);
  for(let y=3;y<=17;y++){ setT(m,10,y,TILE_PATH); setT(m,11,y,TILE_PATH); }
  for(let x=3;x<=17;x++){ setT(m,x,10,TILE_PATH); setT(m,x,7,TILE_PATH); }
  // Trees and flowers for Ember (grass/fire theme)
  const trees=[[3,3],[4,3],[16,3],[16,4],[3,16],[4,16],[16,16],[15,16],[3,10],[17,10]];
  for(const [x,y] of trees) setT(m,x,y,TILE_TREE);
  decoFlowers(m,[[5,5],[6,5],[14,5],[15,5],[5,13],[6,13],[14,13],[15,13],[7,15],[8,15],[12,15],[13,15],[5,9],[6,9]]);
  // Pond
  setT(m,5,5,TILE_WATER); setT(m,6,5,TILE_WATER);
  // Buildings detailed
  const pc = placeBuilding(m, 5, 4, 4, 4, 2, TILE_HEAL);
  const mart = placeBuilding(m, 12, 4, 4, 4, 1, TILE_SHOP);
  const gym = placeBuilding(m, 5, 11, 5, 4, 2, TILE_GYM); // Nature Gym west
  const house = placeBuilding(m, 12, 12, 4, 3, 1, TILE_SIGN);
  // Signs
  setT(m,8,7,TILE_SIGN); m.signs.push({x:8,y:7,text:"Ember Town - Gateway to adventure!"});
  setT(m,10,6,TILE_SIGN); m.signs.push({x:10,y:6,text:"Nature Lodge Gym"});
  // Route connections clearly
  setT(m,10,0,TILE_DOOR); setT(m,11,0,TILE_DOOR);
  m.doors.push({x:10,y:0,dest:1,destX:10,destY:18});
  m.doors.push({x:11,y:0,dest:1,destX:11,destY:18});
  setT(m,10,19,TILE_DOOR); setT(m,11,19,TILE_DOOR);
  m.doors.push({x:10,y:19,dest:3,destX:10,destY:1});
  m.doors.push({x:11,y:19,dest:3,destX:11,destY:1});
  // Interior doors
  m.doors.push({x:pc.doorX,y:pc.doorY,dest:15,destX:5,destY:8});
  m.doors.push({x:mart.doorX,y:mart.doorY,dest:16,destX:5,destY:8});
  m.doors.push({x:gym.doorX,y:gym.doorY,dest:17,destX:6,destY:11});
  m.doors.push({x:house.doorX,y:house.doorY,dest:18,destX:4,destY:6});
  // NPCs placed around buildings logically
  m.npcs.push({x:7,y:6,type:"gym_leader",name:"Flora",dialog:["I am Flora, Nature Lodge Leader!","Welcome, {name}!","My plants will entangle you!"],facing:"down",defeated:false,party:[[3,12],[25,11],[15,13]],badge:"Nature Badge",reward:3000,rematchParty:[[6,38],[26,37],[44,36],[28,35]],rematchDialog:["Nature has grown since we last met, {name}!"],aiLevel:AI_GYM});
  m.npcs.push({x:7,y:10,type:"healer",name:"Nurse Joy",dialog:["Welcome, {name}!","Let me heal your Minis!"],facing:"down"});
  m.npcs.push({x:14,y:6,type:"talker",name:"Mart Clerk Out",dialog:["Marts have great deals!"],facing:"down"});
  m.npcs.push({x:14,y:8,type:"trainer",name:"Blaze",dialog:["I am Blaze, the Inferno Dojo Leader!","Welcome, {name}!","Feel the heat!"],facing:"down",defeated:false,party:[[1,14],[21,13],[11,15]],badge:"Inferno Badge",reward:4000,rematchParty:[[4,40],[56,39],[70,38],[98,37]],rematchDialog:["Inferno rages!"],aiLevel:AI_GYM});
  m.npcs.push({x:6,y:10,type:"trainer",name:"Camper Iris",dialog:["Nature is my ally!"],facing:"right",defeated:false,party:[[3,10]],rematchParty:[[6,25],[26,24]],rematchDialog:["Nature's power has grown!"],aiLevel:AI_TRAINER});
  m.npcs.push({x:15,y:5,type:"rival",name:"Luna",dialog:["You got the Nature Badge, {name}?","I'm impressed! Let's battle!"],facing:"down",defeated:false,rival_enc:2,rival_party:true});
  m.npcs.push({x:5,y:15,type:"trainer",name:"Team Shadow Grunt",dialog:["Team Shadow will take over!"],facing:"right",defeated:false,party:[[25,12],[35,11]],evil:true,evil_enc:1,rematchParty:[[26,28],[36,27],[46,26]],rematchDialog:["Team Shadow is stronger!"],aiLevel:AI_TRAINER});
  m.npcs.push({x:13,y:14,type:"item_giver",name:"TM Collector",dialog:["I collect TMs!","Here, have this one!"],facing:"down",give_item:I_TM_VWHIP,give_count:1,gave_item:false});
  m.npcs.push({x:10,y:13,type:"trade_npc",name:"Trader Sam",dialog:["I'll trade Fire Mini for Water Mini!","Deal?"],facing:"up",trade_want_type:TYPE_WATER,give_dex:11,give_name:"Sparkitten",traded:false});
  m.npcs.push({x:8,y:15,type:"talker",name:"Old Man",dialog:["I remember when this town was fields."]});
  m.npcs.push({x:13,y:10,type:"talker",name:"Backpacker",dialog:["I arrived from Frost Harbor.","Ice Minis are beautiful!"]});
  return m;
}

function createRoute2(){
  srand(99);
  const m=makeMap(20,20,"Route 2",0.15);
  fillBorder(m,TILE_TREE);
  setT(m,10,0,TILE_PATH); setT(m,11,0,TILE_PATH); setT(m,10,19,TILE_PATH); setT(m,11,19,TILE_PATH);
  for(let y=1;y<19;y++) for(let x=1;x<19;x++) setT(m,x,y,sRand()<0.45?TILE_TGRASS:TILE_GRASS);
  for(let y=0;y<20;y++){ setT(m,10,y,TILE_PATH); setT(m,11,y,TILE_PATH); }
  for(let x=5;x<=15;x++){ setT(m,x,9,TILE_PATH); setT(m,x,11,TILE_PATH); }
  for(let y=9;y<=11;y++) for(let x=5;x<=15;x++) setT(m,x,y,TILE_PATH);
  const trees=[[3,3],[16,3],[3,16],[16,16],[6,6],[14,6],[6,14],[14,14],[4,9],[16,9],[4,12],[16,12]];
  for(const [x,y] of trees) setT(m,x,y,TILE_TREE);
  setT(m,7,5,TILE_WATER); setT(m,13,5,TILE_WATER);
  decoFlowers(m,[[8,4],[12,4],[4,7],[5,7],[15,7],[4,13],[5,13],[15,13],[8,15],[12,15]]);
  setT(m,9,1,TILE_SIGN); m.signs.push({x:9,y:1,text:"Route 2 - Ember -> Frost Harbor"});
  setT(m,10,0,TILE_DOOR); setT(m,11,0,TILE_DOOR);
  m.doors.push({x:10,y:0,dest:2,destX:10,destY:18}); m.doors.push({x:11,y:0,dest:2,destX:11,destY:18});
  setT(m,10,19,TILE_DOOR); setT(m,11,19,TILE_DOOR);
  m.doors.push({x:10,y:19,dest:4,destX:10,destY:1}); m.doors.push({x:11,y:19,dest:4,destX:11,destY:1});
  m.npcs.push({x:8,y:10,type:"trainer",name:"Ranger Hank",dialog:["I protect the wild Minis!","Let's battle!"],facing:"right",defeated:false,party:[[21,14],[22,14]],rematchParty:[[32,28],[42,27],[22,26]],rematchDialog:["The wild Minis need more protection now!"],aiLevel:AI_TRAINER});
  m.npcs.push({x:14,y:11,type:"trainer",name:"Lass Maya",dialog:["My team is ready!","Let's go!"],facing:"left",defeated:false,party:[[49,15],[13,15]],rematchParty:[[50,30],[14,29],[98,28]],rematchDialog:["I've been training every day!"],aiLevel:AI_TRAINER});
  m.npcs.push({x:10,y:6,type:"talker",name:"Hiker",dialog:["Watch for tall grass!","Heed the flowers!"],facing:"down"});
  m.encTable=[[21,5],[23,5],[27,5],[29,5],[17,5],[9,5],[93,5],[97,5]];
  return m;
}

function createFrostHarbor(){
  const m=makeMap(20,20,"Frost Harbor",0.10);
  for(let y=0;y<20;y++) for(let x=0;x<20;x++) setT(m,x,y,TILE_GRASS);
  fillBorder(m,TILE_TREE);
  setT(m,10,0,TILE_PATH); setT(m,11,0,TILE_PATH); setT(m,10,19,TILE_PATH); setT(m,11,19,TILE_PATH);
  fillRect(m,3,3,17,17,TILE_PATH);
  for(let y=3;y<=17;y++){ setT(m,10,y,TILE_PATH); setT(m,11,y,TILE_PATH); }
  for(let x=3;x<=17;x++){ setT(m,x,10,TILE_PATH); }
  // Harbour water edge east
  for(let y=4;y<=8;y++) for(let x=14;x<=17;x++) setT(m,x,y,TILE_WATER);
  // Trees and ice decor
  const trees=[[3,3],[4,3],[3,4],[16,9],[17,10],[3,16],[4,16],[16,16],[15,16]];
  for(const [x,y] of trees) setT(m,x,y,TILE_TREE);
  decoFlowers(m,[[6,5],[7,5],[12,5],[13,5],[6,14],[7,14],[12,14],[13,14]]);
  const pc = placeBuilding(m, 5, 5, 4, 4, 2, TILE_HEAL);
  const mart = placeBuilding(m, 11, 5, 4, 4, 1, TILE_SHOP);
  const gym = placeBuilding(m, 8, 11, 5, 4, 2, TILE_GYM);
  setT(m,12,8,TILE_SIGN); m.signs.push({x:12,y:8,text:"Frost Harbor - Where ice meets sea!"});
  setT(m,9,10,TILE_SIGN); m.signs.push({x:9,y:10,text:"Tidal Temple Gym"});
  setT(m,10,0,TILE_DOOR); setT(m,11,0,TILE_DOOR);
  m.doors.push({x:10,y:0,dest:3,destX:10,destY:18}); m.doors.push({x:11,y:0,dest:3,destX:11,destY:18});
  setT(m,10,19,TILE_DOOR); setT(m,11,19,TILE_DOOR);
  m.doors.push({x:10,y:19,dest:5,destX:10,destY:1}); m.doors.push({x:11,y:19,dest:5,destX:11,destY:1});
  m.doors.push({x:pc.doorX,y:pc.doorY,dest:19,destX:5,destY:8});
  m.doors.push({x:mart.doorX,y:mart.doorY,dest:20,destX:5,destY:8});
  m.doors.push({x:gym.doorX,y:gym.doorY,dest:21,destX:6,destY:11});
  m.npcs.push({x:10,y:9,type:"gym_leader",name:"Glacia",dialog:["I am Glacia, Tidal Temple Leader!","Welcome, {name}!","Feel the power of the ocean!"],facing:"down",defeated:false,party:[[22,22],[32,21],[42,23]],badge:"Tidal Badge",reward:5000,rematchParty:[[5,42],[32,41],[42,40],[94,39]],rematchDialog:["The tides answer to me, {name}!"],aiLevel:AI_GYM});
  m.npcs.push({x:7,y:7,type:"healer",name:"Nurse Joy",dialog:["Welcome, {name}!","Let me heal your Minis!"],facing:"down"});
  m.npcs.push({x:6,y:12,type:"trainer",name:"Sailor Drake",dialog:["The sea is my home!"],facing:"right",defeated:false,party:[[31,16],[5,16]],rematchParty:[[32,32],[22,31],[5,30]],rematchDialog:["The ocean calls us back!"],aiLevel:AI_TRAINER});
  m.npcs.push({x:15,y:15,type:"trainer",name:"Team Shadow Elite",dialog:["Team Shadow's power grows!"],facing:"up",defeated:false,party:[[25,20],[35,19],[45,18]],evil:true,evil_enc:2,rematchParty:[[26,36],[36,35],[46,34],[58,33]],rematchDialog:["You think you stopped us?"],aiLevel:AI_GYM});
  m.npcs.push({x:12,y:7,type:"item_giver",name:"Fisher",dialog:["Caught something special!","You can have it!"],facing:"down",give_item:I_TM_WGUN,give_count:1,gave_item:false});
  m.npcs.push({x:14,y:10,type:"trade_npc",name:"Trader Marina",dialog:["I'll trade Ice Mini for Fire Mini!","Deal?"],facing:"left",trade_want_type:TYPE_FIRE,give_dex:32,give_name:"Reefguard",traded:false});
  m.npcs.push({x:7,y:7,type:"talker",name:"Sailor",dialog:["Harbor is beautiful at sunset."]});
  m.npcs.push({x:8,y:14,type:"talker",name:"Ice Fisher",dialog:["I fish through ice!"]});
  return m;
}

function createStormSpire(){
  const m=makeMap(20,20,"Storm Spire",0.10);
  fillBorder(m,TILE_ROCK);fillRect(m,5,5,14,14,TILE_PATH);
  // Detailed rocky spire with path
  for(let y=5;y<=14;y++){ setT(m,10,y,TILE_PATH); setT(m,11,y,TILE_PATH); }
  const pc = placeBuilding(m, 5, 5, 4, 3, 1, TILE_HEAL);
  const gym = placeBuilding(m, 12, 5, 4, 3, 2, TILE_GYM);
  setT(m,10,0,TILE_DOOR); setT(m,11,0,TILE_DOOR); m.doors.push({x:10,y:0,dest:4,destX:10,destY:18}); m.doors.push({x:11,y:0,dest:4,destX:11,destY:18});
  setT(m,10,19,TILE_DOOR); setT(m,11,19,TILE_DOOR); m.doors.push({x:10,y:19,dest:6,destX:10,destY:1}); m.doors.push({x:11,y:19,dest:6,destX:11,destY:1});
  setT(m,8,13,TILE_SIGN); m.signs.push({x:8,y:13,text:"Storm Spire - Power of Thunder"});
  // Interiors
  // (doors for interiors added below)
  // Placeholder to keep PC/Gym doors
  m.doors.push({x:pc.doorX,y:pc.doorY,dest:22,destX:5,destY:8});
  m.doors.push({x:gym.doorX,y:gym.doorY,dest:24,destX:6,destY:11});
  m.npcs.push({x:10,y:7,type:"gym_leader",name:"Volt",dialog:["I am Volt, Storm Spire Leader!","Welcome, {name}!","Feel the power of lightning!"],facing:"down",defeated:false,party:[[23,28],[33,26]],badge:"Storm Badge",reward:6000,rematchParty:[[12,44],[46,43],[64,42],[28,41]],rematchDialog:["Lightning strikes twice, {name}!"],aiLevel:AI_GYM});
  m.npcs.push({x:10,y:11,type:"healer",name:"Nurse Joy",dialog:["Welcome, {name}!","Let me heal your Minis!"],facing:"up"});
  m.npcs.push({x:6,y:10,type:"trainer",name:"Sparky",dialog:["My Electric moves are shocking!"],facing:"right",defeated:false,party:[[23,20],[33,19]],rematchParty:[[23,38],[33,37],[63,36]],rematchDialog:["Voltage cranked to maximum!"],aiLevel:AI_GYM});
  m.npcs.push({x:14,y:10,type:"item_giver",name:"Electric Engineer",dialog:["I study lightning!","Here, take this TM!"],facing:"left",give_item:I_TM_TSHOCK,give_count:1,gave_item:false});
  m.npcs.push({x:8,y:8,type:"talker",name:"Climber",dialog:["The view from the top is incredible!","But be careful of falling rocks!"]});
  m.npcs.push({x:13,y:13,type:"talker",name:"Storm Chaser",dialog:["I study storms!","The Electric Minis here love the thunder!"]});
  m.signs.push({x:12,y:10,text:"Storm Spire - Where thunder rules!"});
  return m;
}

function createCrystalCavern(){
  const m=makeMap(20,20,"Crystal Cavern",0.10);
  fillBorder(m,TILE_ROCK);
  fillRect(m,3,3,17,17,TILE_GROUND);
  for(let y=3;y<=17;y++){ setT(m,10,y,TILE_PATH); setT(m,11,y,TILE_PATH); }
  for(let y=6;y<=12;y++){ setT(m,6,y,TILE_PATH); setT(m,14,y,TILE_PATH); }
  // Crystal formations as ROCK + WATER shimmer
  for(let x=4;x<=7;x++) setT(m,x,5,TILE_ROCK);
  for(let x=13;x<=16;x++) setT(m,x,5,TILE_ROCK);
  setT(m,7,7,TILE_WATER); setT(m,14,7,TILE_WATER);
  setT(m,7,13,TILE_WATER); setT(m,14,13,TILE_WATER);
  // Buildings inside cavern
  const pc = placeBuilding(m, 5, 5, 4, 3, 1, TILE_HEAL);
  const gym = placeBuilding(m, 12, 5, 4, 3, 2, TILE_GYM);
  setT(m,8,15,TILE_SIGN); m.signs.push({x:8,y:15,text:"Crystal Cavern - Ice shines eternal"});
  setT(m,10,0,TILE_DOOR); setT(m,11,0,TILE_DOOR); m.doors.push({x:10,y:0,dest:5,destX:10,destY:18}); m.doors.push({x:11,y:0,dest:5,destX:11,destY:18});
  setT(m,10,19,TILE_DOOR); setT(m,11,19,TILE_DOOR); m.doors.push({x:10,y:19,dest:7,destX:10,destY:1}); m.doors.push({x:11,y:19,dest:7,destX:11,destY:1});
  m.doors.push({x:pc.doorX,y:pc.doorY,dest:25,destX:5,destY:8});
  m.doors.push({x:gym.doorX,y:gym.doorY,dest:27,destX:6,destY:11});
  m.npcs.push({x:10,y:7,type:"gym_leader",name:"Frostbane",dialog:["I am Frostbane, Crystal Cavern Leader!","Welcome, {name}!","Feel the chill of eternity!"],facing:"down",defeated:false,party:[[24,32],[34,30]],badge:"Crystal Badge",reward:7000,rematchParty:[[14,46],[38,45],[48,44],[66,43]],rematchDialog:["Eternal frost awaits, {name}!"],aiLevel:AI_GYM});
  m.npcs.push({x:6,y:7,type:"healer",name:"Nurse Joy",dialog:["Welcome, {name}!","Let me heal your Minis!"],facing:"down"});
  m.npcs.push({x:6,y:10,type:"trainer",name:"Frosty",dialog:["My Ice moves are freezing!"],facing:"right",defeated:false,party:[[24,24],[34,23]],rematchParty:[[24,40],[34,39],[66,38]],rematchDialog:["Feel the absolute zero!"],aiLevel:AI_GYM});
  m.npcs.push({x:14,y:10,type:"item_giver",name:"Gem Collector",dialog:["These crystals are mesmerizing!","Take this TM!"],facing:"left",give_item:I_TM_ISHARD,give_count:1,gave_item:false});
  m.npcs.push({x:13,y:13,type:"trade_npc",name:"Trader Frost",dialog:["Dragon Mini for Earth Mini?","Deal?"],facing:"up",trade_want_type:TYPE_EARTH,give_dex:63,give_name:"Tempestrix",traded:false});
  m.npcs.push({x:8,y:8,type:"talker",name:"Geologist",dialog:["Crystals are millions of years old!"]});
  return m;
}

function createShadowGate(){
  const m=makeMap(20,20,"Shadow Gate",0.0);
  fillBorder(m,TILE_ROCK);
  fillRect(m,3,3,17,17,TILE_GROUND);
  for(let y=3;y<=17;y++){ setT(m,10,y,TILE_PATH); setT(m,11,y,TILE_PATH); }
  fillRect(m,4,4,16,6,TILE_PATH);
  // Shadow pillars
  for(let y=5;y<=7;y++){ setT(m,5,y,TILE_WALL); setT(m,15,y,TILE_WALL); }
  setT(m,6,5,TILE_ROCK); setT(m,14,5,TILE_ROCK);
  const pc = placeBuilding(m, 5, 8, 4, 3, 1, TILE_HEAL);
  const gym = placeBuilding(m, 12, 8, 4, 3, 2, TILE_GYM);
  setT(m,8,15,TILE_SIGN); m.signs.push({x:8,y:15,text:"Shadow Gate - Darkness dwells"});
  setT(m,10,0,TILE_DOOR); setT(m,11,0,TILE_DOOR); m.doors.push({x:10,y:0,dest:6,destX:10,destY:18}); m.doors.push({x:11,y:0,dest:6,destX:11,destY:18});
  setT(m,10,19,TILE_DOOR); setT(m,11,19,TILE_DOOR); m.doors.push({x:10,y:19,dest:8,destX:10,destY:1}); m.doors.push({x:11,y:19,dest:8,destX:11,destY:1});
  m.doors.push({x:pc.doorX,y:pc.doorY,dest:27,destX:5,destY:8});
  m.doors.push({x:gym.doorX,y:gym.doorY,dest:27,destX:6,destY:11});
  m.npcs.push({x:10,y:6,type:"gym_leader",name:"Nyx",dialog:["I am Nyx, Shadow Gate Leader!","Embrace the darkness!"],facing:"down",defeated:false,party:[[25,36],[35,34]],badge:"Shadow Badge",reward:8000,rematchParty:[[16,48],[58,47],[68,46],[87,45]],rematchDialog:["Darkness knows no limits!"],aiLevel:AI_GYM});
  m.npcs.push({x:6,y:10,type:"healer",name:"Nurse Joy",dialog:["Welcome!","Let me heal!"],facing:"down"});
  m.npcs.push({x:14,y:14,type:"trainer",name:"Team Shadow Boss",dialog:["I am the Boss!","You dare challenge?"],facing:"up",defeated:false,party:[[25,35],[35,34],[45,33],[55,32]],evil:true,evil_enc:3,rematchParty:[[58,52],[68,51],[46,50],[36,49]],rematchDialog:["Never falls!"],aiLevel:AI_ELITE});
  m.npcs.push({x:8,y:10,type:"item_giver",name:"Shadow Researcher",dialog:["Study dark energy!","Take this TM!"],facing:"down",give_item:I_TM_SBALL,give_count:1,gave_item:false});
  m.npcs.push({x:13,y:10,type:"talker",name:"Dark Walker",dialog:["Shadows are alive!"]});
  m.npcs.push({x:8,y:12,type:"talker",name:"Former Grunt",dialog:["I left Team Shadow."]});
  return m;
}

function createSolarSanctum(){
  const m=makeMap(20,20,"Solar Sanctum",0.0);
  for(let y=0;y<20;y++) for(let x=0;x<20;x++) setT(m,x,y,TILE_GRASS);
  fillBorder(m,TILE_TREE);
  fillRect(m,3,3,17,17,TILE_PATH);
  for(let y=3;y<=17;y++){ setT(m,10,y,TILE_PATH); setT(m,11,y,TILE_PATH); }
  decoFlowers(m,[[5,5],[6,5],[14,5],[15,5],[5,14],[6,14],[14,14],[15,14],[8,6],[12,6]]);
  // Sun fountain center
  setT(m,10,8,TILE_WATER); setT(m,11,8,TILE_WATER); setT(m,10,9,TILE_WATER); setT(m,11,9,TILE_WATER);
  for(let x=9;x<=12;x++){ setT(m,x,7,TILE_WALL); setT(m,x,10,TILE_WALL); }
  for(let y=8;y<=9;y++){ setT(m,9,y,TILE_WALL); setT(m,12,y,TILE_WALL); }
  const pc = placeBuilding(m, 5, 5, 4, 3, 1, TILE_HEAL);
  const gym = placeBuilding(m, 12, 5, 4, 3, 2, TILE_GYM);
  setT(m,8,15,TILE_SIGN); m.signs.push({x:8,y:15,text:"Solar Sanctum - Light is born"});
  setT(m,10,0,TILE_DOOR); setT(m,11,0,TILE_DOOR); m.doors.push({x:10,y:0,dest:7,destX:10,destY:18}); m.doors.push({x:11,y:0,dest:7,destX:11,destY:18});
  setT(m,10,19,TILE_DOOR); setT(m,11,19,TILE_DOOR); m.doors.push({x:10,y:19,dest:9,destX:10,destY:1}); m.doors.push({x:11,y:19,dest:9,destX:11,destY:1});
  m.doors.push({x:pc.doorX,y:pc.doorY,dest:29,destX:5,destY:8});
  m.doors.push({x:gym.doorX,y:gym.doorY,dest:29,destX:6,destY:11});
  m.npcs.push({x:10,y:6,type:"gym_leader",name:"Lux",dialog:["I am Lux, Solar Sanctum Leader!","Behold the light!"],facing:"down",defeated:false,party:[[26,40],[36,38]],badge:"Solar Badge",reward:9000,rematchParty:[[50,50],[72,49],[48,48],[8,47]],rematchDialog:["Dawn shines brighter!"],aiLevel:AI_GYM});
  m.npcs.push({x:6,y:7,type:"healer",name:"Nurse Joy",dialog:["Welcome!","Let me heal!"],facing:"down"});
  m.npcs.push({x:6,y:10,type:"trainer",name:"Dawn",dialog:["My Light moves shine!"],facing:"right",defeated:false,party:[[26,32],[36,31]],rematchParty:[[26,48],[36,47],[72,46]],rematchDialog:["Light blinds all!"],aiLevel:AI_ELITE});
  m.npcs.push({x:14,y:10,type:"item_giver",name:"Light Keeper",dialog:["Light guides us!","Take this TM!"],facing:"left",give_item:I_TM_DGLEAM,give_count:1,gave_item:false});
  m.npcs.push({x:13,y:13,type:"trade_npc",name:"Trader Lux",dialog:["Spirit for Wind?","Deal?"],facing:"up",trade_want_type:TYPE_WIND,give_dex:46,give_name:"Voltsnake",traded:false});
  m.npcs.push({x:8,y:8,type:"talker",name:"Sun Priest",dialog:["Sun charges our Minis!"]});
  return m;
}

function createGrandColosseum(){
  const m=makeMap(20,20,"Grand Colosseum",0.0);
  fillBorder(m,TILE_ROCK);
  fillRect(m,3,3,17,17,TILE_GROUND);
  for(let y=3;y<=17;y++){ setT(m,10,y,TILE_PATH); setT(m,11,y,TILE_PATH); }
  for(let x=6;x<=14;x++){ setT(m,x,10,TILE_PATH); }
  // Colosseum pillars
  for(let y=5;y<=7;y++){ setT(m,5,y,TILE_WALL); setT(m,15,y,TILE_WALL); }
  for(let y=13;y<=15;y++){ setT(m,5,y,TILE_WALL); setT(m,15,y,TILE_WALL); }
  setT(m,6,5,TILE_ROCK); setT(m,14,5,TILE_ROCK);
  const pc = placeBuilding(m, 5, 8, 4, 3, 1, TILE_HEAL);
  const gym = placeBuilding(m, 12, 8, 4, 3, 2, TILE_GYM);
  setT(m,8,15,TILE_SIGN); m.signs.push({x:8,y:15,text:"Grand Colosseum - Legends clash"});
  setT(m,10,0,TILE_DOOR); setT(m,11,0,TILE_DOOR); m.doors.push({x:10,y:0,dest:8,destX:10,destY:18}); m.doors.push({x:11,y:0,dest:8,destX:11,destY:18});
  setT(m,10,19,TILE_DOOR); setT(m,11,19,TILE_DOOR); m.doors.push({x:10,y:19,dest:10,destX:10,destY:1}); m.doors.push({x:11,y:19,dest:10,destX:11,destY:1});
  m.doors.push({x:pc.doorX,y:pc.doorY,dest:31,destX:5,destY:8});
  m.doors.push({x:gym.doorX,y:gym.doorY,dest:31,destX:6,destY:11});
  m.npcs.push({x:10,y:6,type:"gym_leader",name:"Drakon",dialog:["I am Drakon!","Witness the might of dragons!"],facing:"down",defeated:false,party:[[27,44],[37,42]],badge:"Dragon Badge",reward:10000,rematchParty:[[40,54],[60,53],[72,52],[58,51]],rematchDialog:["Dragon's soul burns eternal!"],aiLevel:AI_GYM});
  m.npcs.push({x:6,y:10,type:"healer",name:"Nurse Joy",dialog:["Welcome!","Let me heal!"],facing:"down"});
  m.npcs.push({x:6,y:11,type:"trainer",name:"Wyvern",dialog:["Dragon moves are fierce!"],facing:"right",defeated:false,party:[[27,36],[37,35]],rematchParty:[[27,52],[37,51],[58,50]],rematchDialog:["Fury is absolute!"],aiLevel:AI_ELITE});
  m.npcs.push({x:14,y:10,type:"item_giver",name:"Dragon Master",dialog:["Only worthy carry this TM!"],facing:"left",give_item:I_TM_DCLAW,give_count:1,gave_item:false});
  m.npcs.push({x:8,y:8,type:"talker",name:"Arena Spectator",dialog:["Battles for centuries!"]});
  m.npcs.push({x:12,y:13,type:"talker",name:"Dragon Breeder",dialog:["I raise dragons!"]});
  return m;
}

function createElite4Hall(){
  const m=makeMap(20,20,"Elite Four Hall",0.0);
  fillBorder(m,TILE_ROCK);
  fillRect(m,3,3,17,17,TILE_GROUND);
  for(let y=3;y<=17;y++){ setT(m,10,y,TILE_PATH); setT(m,11,y,TILE_PATH); }
  // Grand pillars
  for(let y=5;y<=15;y+=5){ setT(m,5,y,TILE_WALL); setT(m,15,y,TILE_WALL); }
  for(let y=4;y<=16;y++){ setT(m,7,y,TILE_WALL); setT(m,13,y,TILE_WALL); }
  setT(m,10,10,TILE_HEAL); setT(m,8,10,TILE_SIGN); m.signs.push({x:8,y:10,text:"Elite Four Hall - Only the worthy may pass!"});
  setT(m,10,0,TILE_DOOR); setT(m,11,0,TILE_DOOR); m.doors.push({x:10,y:0,dest:9,destX:10,destY:18}); m.doors.push({x:11,y:0,dest:9,destX:11,destY:18});
  setT(m,10,19,TILE_DOOR); setT(m,11,19,TILE_DOOR); m.doors.push({x:10,y:19,dest:11,destX:10,destY:1}); m.doors.push({x:11,y:19,dest:11,destX:11,destY:1});
  m.npcs.push({x:10,y:11,type:"healer",name:"Nurse Joy",dialog:["Welcome, {name}!","Let me heal!"],facing:"up"});
  m.npcs.push({x:10,y:5,type:"trainer",name:"Elite Aria",dialog:["I am Aria of the Elite Four!","My melodies shall console you!"],facing:"down",defeated:false,party:[[44,50],[54,49],[64,48]],reward:12000,rematchParty:[[44,68],[54,67],[64,66],[72,65]],rematchDialog:["My symphony has reached new heights!"],aiLevel:AI_ELITE});
  m.npcs.push({x:5,y:10,type:"trainer",name:"Elite Terra",dialog:["I am Terra!","Earth trembles!"],facing:"right",defeated:false,party:[[45,52],[55,51],[65,50]],reward:12000,rematchParty:[[45,70],[55,69],[65,68],[74,67]],rematchDialog:["Earth's fury boundless!"],aiLevel:AI_ELITE});
  m.npcs.push({x:15,y:10,type:"trainer",name:"Elite Umbra",dialog:["I am Umbra!","Shadow and nightmare!"],facing:"left",defeated:false,party:[[46,54],[56,53],[66,52]],reward:12000,rematchParty:[[46,72],[56,71],[66,70],[68,69]],rematchDialog:["Void beckons!"],aiLevel:AI_ELITE});
  m.npcs.push({x:10,y:15,type:"trainer",name:"Elite Sol",dialog:["I am Sol!","Radiance purifies!"],facing:"up",defeated:false,party:[[47,56],[57,55],[67,54]],reward:12000,rematchParty:[[47,74],[57,73],[67,72],[80,71]],rematchDialog:["Light is blinding!"],aiLevel:AI_ELITE});
  return m;
}

function createChampionArena(){
  const m=makeMap(20,20,"Champion Arena",0.0);
  fillBorder(m,TILE_ROCK);
  fillRect(m,3,3,17,17,TILE_GROUND);
  for(let y=3;y<=17;y++){ setT(m,10,y,TILE_PATH); setT(m,11,y,TILE_PATH); }
  // Throne platform
  fillRect(m,8,4,13,6,TILE_WALL);
  setT(m,10,5,TILE_ROCK); setT(m,11,5,TILE_ROCK);
  setT(m,8,10,TILE_SIGN); m.signs.push({x:8,y:10,text:"Champion Arena - The Final Battle!"});
  setT(m,10,0,TILE_DOOR); setT(m,11,0,TILE_DOOR); m.doors.push({x:10,y:0,dest:10,destX:10,destY:18}); m.doors.push({x:11,y:0,dest:10,destX:11,destY:18});
  setT(m,10,12,TILE_HEAL); setT(m,5,8,TILE_WALL); setT(m,15,8,TILE_WALL);
  m.npcs.push({x:10,y:13,type:"healer",name:"Nurse Joy",dialog:["Welcome, {name}!","Heal up!"],facing:"up"});
  m.npcs.push({x:10,y:7,type:"trainer",name:"Champion Zenith",dialog:["I am Zenith, the Champion!","You have journeyed far!"],facing:"down",defeated:false,party:[[48,60],[58,59],[68,58],[78,57],[1,55],[21,55]],reward:50000,rematchParty:[[60,80],[58,79],[68,78],[78,77],[52,76],[88,75]],rematchDialog:["True champion!"],aiLevel:AI_CHAMPION});
  return m;
}

// ===== INTERIOR MAPS =====
const INTERIOR_MAPS_START = 12;

function createPokemonCenterInterior(exteriorMapIdx, exitX, exitY){
  const m=makeMap(12,10,"Pokémon Center",0.0);
  fillRect(m,0,0,11,9,TILE_GROUND);
  for(let x=0;x<12;x++){setT(m,x,0,TILE_WALL);setT(m,x,9,TILE_WALL);}
  for(let y=0;y<10;y++){setT(m,0,y,TILE_WALL);setT(m,11,y,TILE_WALL);}
  // Counter with healing machines
  fillRect(m,2,2,9,3,TILE_WALL);
  setT(m,4,3,TILE_HEAL); setT(m,5,3,TILE_HEAL); setT(m,6,3,TILE_HEAL); setT(m,7,3,TILE_HEAL);
  // Detail: PCs on side tables
  setT(m,2,2,TILE_SHOP); setT(m,9,2,TILE_SHOP);
  setT(m,2,4,TILE_TREE); setT(m,9,4,TILE_TREE); // potted plants
  // Chairs + tables with rugs
  fillRect(m,2,6,5,7,TILE_GROUND); fillRect(m,7,6,10,7,TILE_GROUND);
  setT(m,3,6,TILE_SIGN); setT(m,8,6,TILE_SIGN); // tables
  setT(m,3,8,TILE_WALL); setT(m,4,8,TILE_WALL); // chairs as wall stools
  setT(m,8,8,TILE_WALL); setT(m,9,8,TILE_WALL);
  // Nurse Joy behind counter
  m.npcs.push({x:5,y:3,type:"healer",name:"Nurse Joy",dialog:["Welcome to the Pokémon Center!","Would you like me to heal your Minis?","Your team will be fully restored!"],facing:"down"});
  // Visitor NPCs
  m.npcs.push({x:3,y:7,type:"talker",name:"Visitor",dialog:["I love the Center's music!"],facing:"up"});
  m.npcs.push({x:8,y:7,type:"talker",name:"Visitor",dialog:["My Minis are resting!"],facing:"up"});
  m.signs.push({x:2,y:2,text:"PC Storage System"});
  setT(m,5,9,TILE_DOOR); setT(m,6,9,TILE_DOOR);
  m.doors.push({x:5,y:9,dest:exteriorMapIdx,destX:exitX,destY:exitY});
  m.doors.push({x:6,y:9,dest:exteriorMapIdx,destX:exitX,destY:exitY});
  return m;
}

function createMartInterior(exteriorMapIdx, exitX, exitY){
  const m=makeMap(12,10,"Poké Mart",0.0);
  fillRect(m,0,0,11,9,TILE_GROUND);
  for(let x=0;x<12;x++){setT(m,x,0,TILE_WALL);setT(m,x,9,TILE_WALL);}
  for(let y=0;y<10;y++){setT(m,0,y,TILE_WALL);setT(m,11,y,TILE_WALL);}
  fillRect(m,2,2,9,3,TILE_WALL);
  m.npcs.push({x:5,y:3,type:"shop",name:"Clerk",dialog:["Welcome to the Poké Mart!","What can I get for you?"],facing:"down"});
  // Detailed shelves with items
  for(let x=2;x<=9;x++){ setT(m,x,5,TILE_WALL); setT(m,x,7,TILE_WALL); }
  setT(m,2,6,TILE_SHOP); setT(m,5,6,TILE_SHOP); setT(m,8,6,TILE_SHOP);
  setT(m,3,4,TILE_SIGN); setT(m,8,4,TILE_SIGN); // price signs
  m.npcs.push({x:3,y:8,type:"talker",name:"Shopper",dialog:["I need more Spheres!"],facing:"up"});
  m.npcs.push({x:8,y:8,type:"talker",name:"Shopper",dialog:["TMs are expensive but worth it!"],facing:"up"});
  m.signs.push({x:3,y:4,text:"Today's Deals!"});
  setT(m,5,9,TILE_DOOR); setT(m,6,9,TILE_DOOR);
  m.doors.push({x:5,y:9,dest:exteriorMapIdx,destX:exitX,destY:exitY});
  m.doors.push({x:6,y:9,dest:exteriorMapIdx,destX:exitX,destY:exitY});
  return m;
}

function createGymInterior(exteriorMapIdx, exitX, exitY, leaderName, leaderType, leaderParty, badgeName){
  const m=makeMap(14,12,"Gym",0.0);
  fillRect(m,0,0,13,11,TILE_GROUND);
  for(let x=0;x<14;x++){setT(m,x,0,TILE_WALL);setT(m,x,11,TILE_WALL);}
  for(let y=0;y<12;y++){setT(m,0,y,TILE_WALL);setT(m,13,y,TILE_WALL);}
  // Gym puzzle path - patterned floor
  for(let x=3;x<=10;x+=3) for(let y=4;y<=9;y++) setT(m,x,y,TILE_PATH);
  // Gym leader at top on platform
  fillRect(m,5,2,8,3,TILE_WALL);
  setT(m,6,2,TILE_SIGN); setT(m,8,2,TILE_SIGN); // statues
  m.npcs.push({x:7,y:2,type:"gym_leader",name:leaderName,dialog:["I am the Leader of this Gym!","Let's battle, "+leaderName+"!"],facing:"down",defeated:false,party:leaderParty,badge:badgeName,reward:3000,aiLevel:AI_GYM});
  // Trainers inside gym
  m.npcs.push({x:4,y:6,type:"trainer",name:"Gym Trainer",dialog:["Prove yourself!"],facing:"right",defeated:false,party:[[3,8]],aiLevel:AI_TRAINER});
  m.npcs.push({x:10,y:6,type:"trainer",name:"Gym Trainer",dialog:["The Leader is strong!"],facing:"left",defeated:false,party:[[3,8]],aiLevel:AI_TRAINER});
  setT(m,6,11,TILE_DOOR); setT(m,7,11,TILE_DOOR);
  m.doors.push({x:6,y:11,dest:exteriorMapIdx,destX:exitX,destY:exitY});
  m.doors.push({x:7,y:11,dest:exteriorMapIdx,destX:exitX,destY:exitY});
  return m;
}

function createHouseInterior(exteriorMapIdx, exitX, exitY, npcData){
  const m=makeMap(10,8,"House",0.0);
  fillRect(m,0,0,9,7,TILE_GROUND);
  for(let x=0;x<10;x++){setT(m,x,0,TILE_WALL);setT(m,x,7,TILE_WALL);}
  for(let y=0;y<8;y++){setT(m,0,y,TILE_WALL);setT(m,9,y,TILE_WALL);}
  // Rug
  fillRect(m,3,3,6,5,TILE_PATH);
  if(npcData){
    m.npcs.push({x:5,y:3,type:npcData.type,name:npcData.name,dialog:npcData.dialog,facing:"down",give_item:npcData.give_item,give_count:npcData.give_count,gave_item:false});
  }
  // Furniture detailed: bed, table, plant, TV
  setT(m,2,2,TILE_WALL); setT(m,2,3,TILE_WALL); // bed
  setT(m,7,2,TILE_SHOP); setT(m,7,3,TILE_SIGN); // table + TV
  setT(m,2,5,TILE_TREE); // plant
  setT(m,7,5,TILE_SHOP); // shelf
  m.npcs.push({x:3,y:4,type:"talker",name:"Resident",dialog:["Make yourself at home!"],facing:"right"});
  setT(m,4,7,TILE_DOOR); setT(m,5,7,TILE_DOOR);
  m.doors.push({x:4,y:7,dest:exteriorMapIdx,destX:exitX,destY:exitY});
  m.doors.push({x:5,y:7,dest:exteriorMapIdx,destX:exitX,destY:exitY});
  return m;
}

// Add interior maps to MAP_CREATORS
const MAP_CREATORS=[createStartingTown,createRoute1,createEmberTown,createRoute2,createFrostHarbor,createStormSpire,createCrystalCavern,createShadowGate,createSolarSanctum,createGrandColosseum,createElite4Hall,createChampionArena,
  // 12: Starter Village Pokémon Center
  () => createPokemonCenterInterior(0,10,11),
  // 13: Starter Village Mart
  () => createMartInterior(0,11,11),
  // 14: Starter Village House (rival's mom)
  () => createHouseInterior(0,6,9,{type:"talker",name:"Rival's Mom",dialog:["My daughter Luna is out training.","She'll be your rival, {name}!","Good luck to you both!"]}),
  // 15: Ember Town Pokémon Center
  () => createPokemonCenterInterior(2,10,11),
  // 16: Ember Town Mart
  () => createMartInterior(2,11,11),
  // 17: Ember Town Gym (Nature Lodge)
  () => createGymInterior(2,10,1,"Flora","Grass",[[3,12],[25,11],[15,13]],"Nature Badge"),
  // 18: Ember Town House (TM Collector)
  () => createHouseInterior(2,8,12,{type:"item_giver",name:"TM Collector",dialog:["I collect TMs!","Here, have this one!"],give_item:I_TM_VWHIP,give_count:1}),
  // 19: Frost Harbor Pokémon Center
  () => createPokemonCenterInterior(4,10,11),
  // 20: Frost Harbor Mart
  () => createMartInterior(4,11,11),
  // 21: Frost Harbor Gym (Tidal Temple)
  () => createGymInterior(4,10,1,"Glacia","Water",[[22,22],[32,21],[42,23]],"Tidal Badge"),
  // 22: Storm Spire Pokémon Center
  () => createPokemonCenterInterior(5,10,11),
  // 23: Storm Spire Mart
  () => createMartInterior(5,11,11),
  // 24: Storm Spire Gym
  () => createGymInterior(5,10,1,"Volt","Electric",[[11,22],[12,21],[45,23]],"Storm Badge"),
  // 25: Crystal Cavern Pokémon Center
  () => createPokemonCenterInterior(6,10,11),
  // 26: Crystal Cavern Mart
  () => createMartInterior(6,11,11),
  // 27: Shadow Gate Pokémon Center
  () => createPokemonCenterInterior(7,10,11),
  // 28: Shadow Gate Mart
  () => createMartInterior(7,11,11),
  // 29: Solar Sanctum Pokémon Center
  () => createPokemonCenterInterior(8,10,11),
  // 30: Solar Sanctum Mart
  () => createMartInterior(8,11,11),
  // 31: Grand Colosseum Pokémon Center
  () => createPokemonCenterInterior(9,10,11),
  // 32: Grand Colosseum Mart
  () => createMartInterior(9,11,11),
];

// MAP_COUNT updated to 32 (handled by MAP_CREATORS length)
