// Minimon - World/Maps (12 maps)
const MAP_COUNT=12;

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

// Seeded random for map generation
let _seed=12345;
function srand(s){_seed=s;}
function sRand(){_seed=(_seed*1103515245+12345)&0x7fffffff;return _seed/0x7fffffff;}

function createStartingTown(){
  const m=makeMap(20,20,"Starter Village",0.0);
  fillBorder(m,TILE_TREE);
  fillRect(m,5,5,14,14,TILE_PATH);
  // Buildings: Pokémon Center (10,10), Mart (11,10), Sign (12,10)
  setT(m,10,10,TILE_HEAL);setT(m,11,10,TILE_SHOP);setT(m,12,10,TILE_SIGN);
  // Building doors (2 tiles wide each)
  setT(m,10,12,TILE_DOOR);setT(m,11,12,TILE_DOOR); // Pokémon Center
  setT(m,11,12,TILE_DOOR);setT(m,12,12,TILE_DOOR); // Mart (overlap handled)
  // Path to buildings
  for(let x=7;x<13;x++)setT(m,x,12,TILE_PATH);
  setT(m,10,12,TILE_DOOR);setT(m,11,12,TILE_DOOR);
  // House at (6,8) - rival's mom
  setT(m,6,12,TILE_DOOR);setT(m,7,12,TILE_DOOR);
  // NPCs
  m.npcs.push({x:10,y:8,type:"professor",name:"Prof. Sage",dialog:["I'm Prof. Sage!","Good to see you, {name}!","Welcome to the world of Minimon!","Choose your partner wisely!"],facing:"down"});
  m.npcs.push({x:10,y:11,type:"healer",name:"Nurse Joy",dialog:["Welcome, {name}!","Let me heal your Minis!"],facing:"up"});
  m.npcs.push({x:6,y:8,type:"talker",name:"Rival's Mom",dialog:["My daughter Luna is out training.","She'll be your rival, {name}!","Good luck to you both!"],facing:"right"});
  m.npcs.push({x:8,y:8,type:"item_giver",name:"Kind Old Man",dialog:["I don't battle anymore, {name}.","But I have this for you!"],facing:"right",give_item:I_POTION,give_count:5,gave_item:false});
  m.npcs.push({x:13,y:8,type:"giver",name:"Wandering Sage",dialog:["I've traveled far and wide, {name}.","Here, take this TM!"],facing:"left",give_item:I_TM_BITE,give_count:1,gave_item:false});
  m.npcs.push({x:7,y:13,type:"talker",name:"Villager",dialog:["This town is peaceful, {name}.","But the routes can be dangerous!"],facing:"right"});
  m.npcs.push({x:13,y:13,type:"talker",name:"Fisherman",dialog:["I love fishing, {name}!","Have you seen the Water Minis?"]});
  m.npcs.push({x:12,y:10,type:"talker",name:"Sign Reader",dialog:["Welcome to Starter Village, {name}!","Speak to Prof. Sage to get your first Mini!"]});
  m.signs.push({x:12,y:10,text:"Starter Village - Where dreams begin!"});
  // Doors: dest index = interior map index
  // Pokémon Center (10,10) -> interior 12
  m.doors.push({x:10,y:12,dest:12,destX:5,destY:9});
  m.doors.push({x:11,y:12,dest:12,destX:6,destY:9});
  // Mart (11,10) -> interior 13
  m.doors.push({x:11,y:12,dest:13,destX:5,destY:9});
  m.doors.push({x:12,y:12,dest:13,destX:6,destY:9});
  // House (6,8) -> interior 14
  m.doors.push({x:6,y:12,dest:14,destX:4,destY:7});
  m.doors.push({x:7,y:12,dest:14,destX:5,destY:7});
  // Route 1 exit
  m.doors.push({x:10,y:18,dest:1,destX:10,destY:18});
  return m;
}

function createRoute1(){
  srand(42);
  const m=makeMap(20,20,"Route 1",0.12);
  fillBorder(m,TILE_TREE);
  for(let y=1;y<19;y++)for(let x=1;x<19;x++)setT(m,x,y,sRand()<0.4?TILE_TGRASS:TILE_GRASS);
  for(let y=8;y<13;y++){setT(m,10,y,TILE_PATH);setT(m,11,y,TILE_PATH);}
  setT(m,10,0,TILE_DOOR);m.doors.push({x:10,y:0,dest:0,destX:10,destY:18});
  setT(m,10,19,TILE_DOOR);m.doors.push({x:10,y:19,dest:2,destX:10,destY:1});
  m.npcs.push({x:7,y:10,type:"trainer",name:"Bug Catcher Tim",dialog:["My bugs are strong!","Let's battle!"],facing:"right",defeated:false,party:[[7,3],[7,3]],rematchParty:[[7,18],[91,17],[7,20]],rematchDialog:["My bugs evolved!","Let's go again!"],aiLevel:AI_ROOKIE});
  m.npcs.push({x:14,y:10,type:"trainer",name:"Youngster Joey",dialog:["I like shorts!","They're comfy and easy to wear!"],facing:"left",defeated:false,party:[[9,4],[11,4]],rematchParty:[[10,20],[12,19],[51,18]],rematchDialog:["I trained hard!","Battle me again!"],aiLevel:AI_TRAINER});
  m.npcs.push({x:10,y:5,type:"rival",name:"Luna",dialog:["So we meet again, {name}!","Let me see how much you've grown!"],facing:"down",defeated:false,rival_enc:1,rival_party:true});
  m.encTable=[[7,3],[9,3],[13,3],[15,3],[17,3],[23,3],[91,3],[95,3]];
  return m;
}

function createEmberTown(){
  const m=makeMap(20,20,"Ember Town",0.0);
  fillBorder(m,TILE_TREE);fillRect(m,3,3,16,16,TILE_PATH);
  setT(m,10,10,TILE_HEAL);setT(m,11,10,TILE_SHOP);setT(m,10,5,TILE_GYM);
  // Building doors
  setT(m,10,12,TILE_DOOR);setT(m,11,12,TILE_DOOR); // Pokémon Center
  setT(m,10,12,TILE_DOOR);setT(m,11,12,TILE_DOOR); // Mart
  setT(m,9,7,TILE_DOOR);setT(m,10,7,TILE_DOOR); // Gym (at y=5, door at y=7)
  setT(m,8,14,TILE_DOOR);setT(m,9,14,TILE_DOOR); // TM Collector house
  // Route connections
  setT(m,10,0,TILE_DOOR);m.doors.push({x:10,y:0,dest:1,destX:10,destY:18});
  setT(m,10,19,TILE_DOOR);m.doors.push({x:10,y:19,dest:3,destX:10,destY:1});
  m.npcs.push({x:10,y:7,type:"gym_leader",name:"Flora",dialog:["I am Flora, the Nature Lodge Leader!","Welcome, {name}!","My plants will entangle you!"],facing:"down",defeated:false,party:[[3,12],[25,11],[15,13]],badge:"Nature Badge",reward:3000,rematchParty:[[6,38],[26,37],[44,36],[28,35]],rematchDialog:["Nature has grown since we last met, {name}!"],aiLevel:AI_GYM});
  m.npcs.push({x:10,y:11,type:"healer",name:"Nurse Joy",dialog:["Welcome, {name}!","Let me heal your Minis!"],facing:"up"});
  m.npcs.push({x:14,y:7,type:"trainer",name:"Blaze",dialog:["I am Blaze, the Inferno Dojo Leader!","Welcome, {name}!","Feel the heat of my flames!"],facing:"down",defeated:false,party:[[1,14],[21,13],[11,15]],badge:"Inferno Badge",reward:4000,rematchParty:[[4,40],[56,39],[70,38],[98,37]],rematchDialog:["Inferno rages beyond control, {name}!"],aiLevel:AI_GYM});
  m.npcs.push({x:6,y:12,type:"trainer",name:"Camper Iris",dialog:["Nature is my ally!"],facing:"right",defeated:false,party:[[3,10]],rematchParty:[[6,25],[26,24]],rematchDialog:["Nature's power has grown!"],aiLevel:AI_TRAINER});
  m.npcs.push({x:15,y:5,type:"rival",name:"Luna",dialog:["You got the Nature Badge, {name}?","I'm impressed! Let's battle!"],facing:"down",defeated:false,rival_enc:2,rival_party:true});
  m.npcs.push({x:5,y:15,type:"trainer",name:"Team Shadow Grunt",dialog:["Team Shadow will take over the world!"],facing:"right",defeated:false,party:[[25,12],[35,11]],evil:true,evil_enc:1,rematchParty:[[26,28],[36,27],[46,26]],rematchDialog:["Team Shadow is stronger than ever!"],aiLevel:AI_TRAINER});
  m.npcs.push({x:8,y:11,type:"item_giver",name:"TM Collector",dialog:["I collect TMs!","Here, have this one!"],facing:"down",give_item:I_TM_VWHIP,give_count:1,gave_item:false});
  m.npcs.push({x:13,y:11,type:"trade_npc",name:"Trader Sam",dialog:["I'll trade you a Fire Mini for your Water Mini!","Deal?"],facing:"left",trade_want_type:TYPE_WATER,give_dex:11,give_name:"Sparkitten",traded:false});
  m.npcs.push({x:7,y:7,type:"talker",name:"Old Man",dialog:["I remember when this town was just fields.","Now we have two gyms!"]});
  m.npcs.push({x:13,y:14,type:"talker",name:"Backpacker",dialog:["I just arrived from Frost Harbor.","The ice Minis there are beautiful!"]});
  m.signs.push({x:12,y:10,text:"Ember Town - Gateway to adventure!"});
  // Interior doors
  m.doors.push({x:10,y:12,dest:15,destX:5,destY:9}); // Pokémon Center
  m.doors.push({x:11,y:12,dest:15,destX:6,destY:9});
  m.doors.push({x:10,y:12,dest:16,destX:5,destY:9}); // Mart
  m.doors.push({x:11,y:12,dest:16,destX:6,destY:9});
  m.doors.push({x:9,y:7,dest:17,destX:6,destY:11}); // Gym
  m.doors.push({x:10,y:7,dest:17,destX:7,destY:11});
  m.doors.push({x:8,y:14,dest:18,destX:4,destY:7}); // TM Collector house
  m.doors.push({x:9,y:14,dest:18,destX:5,destY:7});
  return m;
}

function createRoute2(){
  srand(99);
  const m=makeMap(20,20,"Route 2",0.15);
  fillBorder(m,TILE_TREE);
  for(let y=1;y<19;y++)for(let x=1;x<19;x++)setT(m,x,y,sRand()<0.45?TILE_TGRASS:TILE_GRASS);
  for(let y=8;y<13;y++){setT(m,10,y,TILE_PATH);setT(m,11,y,TILE_PATH);}
  setT(m,10,0,TILE_DOOR);m.doors.push({x:10,y:0,dest:2,destX:10,destY:18});
  setT(m,10,19,TILE_DOOR);m.doors.push({x:10,y:19,dest:4,destX:10,destY:1});
  m.npcs.push({x:8,y:10,type:"trainer",name:"Ranger Hank",dialog:["I protect the wild Minis!"],facing:"right",defeated:false,party:[[21,14],[22,14]],rematchParty:[[32,28],[42,27],[22,26]],rematchDialog:["The wild Minis need more protection now!"],aiLevel:AI_TRAINER});
  m.npcs.push({x:13,y:10,type:"trainer",name:"Lass Maya",dialog:["My team is ready!"],facing:"left",defeated:false,party:[[49,15],[13,15]],rematchParty:[[50,30],[14,29],[98,28]],rematchDialog:["I've been training every day!"],aiLevel:AI_TRAINER});
  m.encTable=[[21,5],[23,5],[27,5],[29,5],[17,5],[9,5],[93,5],[97,5]];
  return m;
}

function createFrostHarbor(){
  const m=makeMap(20,20,"Frost Harbor",0.10);
  fillBorder(m,TILE_TREE);fillRect(m,3,3,16,16,TILE_PATH);
  setT(m,10,10,TILE_HEAL);setT(m,11,10,TILE_SHOP);setT(m,10,5,TILE_GYM);
  // Building doors
  setT(m,10,12,TILE_DOOR);setT(m,11,12,TILE_DOOR); // Pokémon Center
  setT(m,10,12,TILE_DOOR);setT(m,11,12,TILE_DOOR); // Mart
  setT(m,9,7,TILE_DOOR);setT(m,10,7,TILE_DOOR); // Gym
  // Route connections
  setT(m,10,0,TILE_DOOR);m.doors.push({x:10,y:0,dest:3,destX:10,destY:18});
  setT(m,10,19,TILE_DOOR);m.doors.push({x:10,y:19,dest:5,destX:10,destY:1});
  m.npcs.push({x:10,y:7,type:"gym_leader",name:"Glacia",dialog:["I am Glacia, the Tidal Temple Leader!","Welcome, {name}!","Feel the power of the ocean!"],facing:"down",defeated:false,party:[[22,22],[32,21],[42,23]],badge:"Tidal Badge",reward:5000,rematchParty:[[5,42],[32,41],[42,40],[94,39]],rematchDialog:["The tides answer to me, {name}!"],aiLevel:AI_GYM});
  m.npcs.push({x:10,y:11,type:"healer",name:"Nurse Joy",dialog:["Welcome, {name}!","Let me heal your Minis!"],facing:"up"});
  m.npcs.push({x:6,y:12,type:"trainer",name:"Sailor Drake",dialog:["The sea is my home!"],facing:"right",defeated:false,party:[[31,16],[5,16]],rematchParty:[[32,32],[22,31],[5,30]],rematchDialog:["The ocean calls us back!"],aiLevel:AI_TRAINER});
  m.npcs.push({x:15,y:15,type:"trainer",name:"Team Shadow Elite",dialog:["Team Shadow's power grows!"],facing:"up",defeated:false,party:[[25,20],[35,19],[45,18]],evil:true,evil_enc:2,rematchParty:[[26,36],[36,35],[46,34],[58,33]],rematchDialog:["You think you stopped us?"],aiLevel:AI_GYM});
  m.npcs.push({x:8,y:10,type:"item_giver",name:"Fisher",dialog:["Caught something special today!","You can have it!"],facing:"down",give_item:I_TM_WGUN,give_count:1,gave_item:false});
  m.npcs.push({x:14,y:8,type:"trade_npc",name:"Trader Marina",dialog:["I'll trade you an Ice Mini for your Fire Mini!","Deal?"],facing:"left",trade_want_type:TYPE_FIRE,give_dex:32,give_name:"Reefguard",traded:false});
  m.npcs.push({x:7,y:7,type:"talker",name:"Sailor",dialog:["The harbor is beautiful at sunset.","Watch out for storms on Route 2!"]});
  m.npcs.push({x:13,y:14,type:"talker",name:"Ice Fisher",dialog:["I fish through the ice!","Sometimes I catch Frostkit evolve forms!"]});
  m.signs.push({x:12,y:10,text:"Frost Harbor - Where ice meets sea!"});
  // Interior doors
  m.doors.push({x:10,y:12,dest:19,destX:5,destY:9}); // Pokémon Center
  m.doors.push({x:11,y:12,dest:19,destX:6,destY:9});
  m.doors.push({x:10,y:12,dest:20,destX:5,destY:9}); // Mart
  m.doors.push({x:11,y:12,dest:20,destX:6,destY:9});
  m.doors.push({x:9,y:7,dest:21,destX:6,destY:11}); // Gym
  m.doors.push({x:10,y:7,dest:21,destX:7,destY:11});
  return m;
}

function createStormSpire(){
  const m=makeMap(20,20,"Storm Spire",0.10);
  fillBorder(m,TILE_ROCK);fillRect(m,5,5,14,14,TILE_PATH);
  setT(m,10,10,TILE_HEAL);setT(m,10,5,TILE_GYM);
  setT(m,10,0,TILE_DOOR);m.doors.push({x:10,y:0,dest:4,destX:10,destY:18});
  setT(m,10,19,TILE_DOOR);m.doors.push({x:10,y:19,dest:6,destX:10,destY:1});
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
  fillBorder(m,TILE_ROCK);fillRect(m,4,4,15,15,TILE_PATH);
  setT(m,10,10,TILE_HEAL);setT(m,10,5,TILE_GYM);
  setT(m,10,0,TILE_DOOR);m.doors.push({x:10,y:0,dest:5,destX:10,destY:18});
  setT(m,10,19,TILE_DOOR);m.doors.push({x:10,y:19,dest:7,destX:10,destY:1});
  m.npcs.push({x:10,y:7,type:"gym_leader",name:"Frostbane",dialog:["I am Frostbane, Crystal Cavern Leader!","Welcome, {name}!","Feel the chill of eternity!"],facing:"down",defeated:false,party:[[24,32],[34,30]],badge:"Crystal Badge",reward:7000,rematchParty:[[14,46],[38,45],[48,44],[66,43]],rematchDialog:["Eternal frost awaits, {name}!"],aiLevel:AI_GYM});
  m.npcs.push({x:10,y:11,type:"healer",name:"Nurse Joy",dialog:["Welcome, {name}!","Let me heal your Minis!"],facing:"up"});
  m.npcs.push({x:6,y:10,type:"trainer",name:"Frosty",dialog:["My Ice moves are freezing!"],facing:"right",defeated:false,party:[[24,24],[34,23]],rematchParty:[[24,40],[34,39],[66,38]],rematchDialog:["Feel the absolute zero!"],aiLevel:AI_GYM});
  m.npcs.push({x:14,y:8,type:"item_giver",name:"Gem Collector",dialog:["These crystals are mesmerizing!","Take this TM as a souvenir!"],facing:"down",give_item:I_TM_ISHARD,give_count:1,gave_item:false});
  m.npcs.push({x:14,y:12,type:"trade_npc",name:"Trader Frost",dialog:["I'll trade you a Dragon Mini for your Earth Mini!","Deal?"],facing:"left",trade_want_type:TYPE_EARTH,give_dex:63,give_name:"Tempestrix",traded:false});
  m.npcs.push({x:8,y:8,type:"talker",name:"Geologist",dialog:["The crystals here are millions of years old!","Each one holds ancient power!"]});
  m.signs.push({x:12,y:10,text:"Crystal Cavern - Where ice crystal forms!"});
  return m;
}

function createShadowGate(){
  const m=makeMap(20,20,"Shadow Gate",0.0);
  fillBorder(m,TILE_ROCK);fillRect(m,4,4,15,15,TILE_PATH);
  setT(m,10,10,TILE_HEAL);setT(m,10,5,TILE_GYM);
  setT(m,10,0,TILE_DOOR);m.doors.push({x:10,y:0,dest:6,destX:10,destY:18});
  setT(m,10,19,TILE_DOOR);m.doors.push({x:10,y:19,dest:8,destX:10,destY:1});
  m.npcs.push({x:10,y:7,type:"gym_leader",name:"Nyx",dialog:["I am Nyx, Shadow Gate Leader!","Welcome, {name}!","Embrace the darkness!"],facing:"down",defeated:false,party:[[25,36],[35,34]],badge:"Shadow Badge",reward:8000,rematchParty:[[16,48],[58,47],[68,46],[87,45]],rematchDialog:["Darkness knows no limits, {name}!"],aiLevel:AI_GYM});
  m.npcs.push({x:10,y:11,type:"healer",name:"Nurse Joy",dialog:["Welcome, {name}!","Let me heal your Minis!"],facing:"up"});
  m.npcs.push({x:15,y:15,type:"trainer",name:"Team Shadow Boss",dialog:["I am the Boss of Team Shadow!","You dare challenge me?"],facing:"up",defeated:false,party:[[25,35],[35,34],[45,33],[55,32]],evil:true,evil_enc:3,rematchParty:[[58,52],[68,51],[46,50],[36,49]],rematchDialog:["Team Shadow never falls!","Prepare for total darkness!"],aiLevel:AI_ELITE});
  m.npcs.push({x:8,y:8,type:"item_giver",name:"Shadow Researcher",dialog:["I study the dark energy here.","Take this TM for protection!"],facing:"down",give_item:I_TM_SBALL,give_count:1,gave_item:false});
  m.npcs.push({x:14,y:10,type:"talker",name:"Dark Walker",dialog:["The shadows here are alive.","Be careful where you step!"]});
  m.npcs.push({x:8,y:14,type:"talker",name:"Former Grunt",dialog:["I left Team Shadow.","They're more dangerous than you think!"]});
  m.signs.push({x:12,y:10,text:"Shadow Gate - Where darkness dwells!"});
  return m;
}

function createSolarSanctum(){
  const m=makeMap(20,20,"Solar Sanctum",0.0);
  fillBorder(m,TILE_GRASS);fillRect(m,3,3,16,16,TILE_PATH);
  setT(m,10,10,TILE_HEAL);setT(m,10,5,TILE_GYM);
  setT(m,10,0,TILE_DOOR);m.doors.push({x:10,y:0,dest:7,destX:10,destY:18});
  setT(m,10,19,TILE_DOOR);m.doors.push({x:10,y:19,dest:9,destX:10,destY:1});
  m.npcs.push({x:10,y:7,type:"gym_leader",name:"Lux",dialog:["I am Lux, Solar Sanctum Leader!","Welcome, {name}!","Behold the light of dawn!"],facing:"down",defeated:false,party:[[26,40],[36,38]],badge:"Solar Badge",reward:9000,rematchParty:[[50,50],[72,49],[48,48],[8,47]],rematchDialog:["The dawn shines brighter, {name}!"],aiLevel:AI_GYM});
  m.npcs.push({x:10,y:11,type:"healer",name:"Nurse Joy",dialog:["Welcome, {name}!","Let me heal your Minis!"],facing:"up"});
  m.npcs.push({x:6,y:10,type:"trainer",name:"Dawn",dialog:["My Light moves shine bright!"],facing:"right",defeated:false,party:[[26,32],[36,31]],rematchParty:[[26,48],[36,47],[72,46]],rematchDialog:["The light blinds all!"],aiLevel:AI_ELITE});
  m.npcs.push({x:14,y:8,type:"item_giver",name:"Light Keeper",dialog:["The light guides us all!","Take this TM!"],facing:"down",give_item:I_TM_DGLEAM,give_count:1,gave_item:false});
  m.npcs.push({x:14,y:13,type:"trade_npc",name:"Trader Lux",dialog:["I'll trade you a Spirit Mini for your Wind Mini!","Deal?"],facing:"left",trade_want_type:TYPE_WIND,give_dex:46,give_name:"Voltsnake",traded:false});
  m.npcs.push({x:8,y:8,type:"talker",name:"Sun Priest",dialog:["The sun charges our Minis.","Light Minis thrive here!"]});
  m.signs.push({x:12,y:10,text:"Solar Sanctum - Where light is born!"});
  return m;
}

function createGrandColosseum(){
  const m=makeMap(20,20,"Grand Colosseum",0.0);
  fillBorder(m,TILE_ROCK);fillRect(m,3,3,16,16,TILE_PATH);
  setT(m,10,10,TILE_HEAL);setT(m,10,5,TILE_GYM);
  setT(m,10,0,TILE_DOOR);m.doors.push({x:10,y:0,dest:8,destX:10,destY:18});
  setT(m,10,19,TILE_DOOR);m.doors.push({x:10,y:19,dest:10,destX:10,destY:1});
  m.npcs.push({x:10,y:7,type:"gym_leader",name:"Drakon",dialog:["I am Drakon, Grand Colosseum Leader!","Welcome, {name}!","Witness the might of dragons!"],facing:"down",defeated:false,party:[[27,44],[37,42]],badge:"Dragon Badge",reward:10000,rematchParty:[[40,54],[60,53],[72,52],[58,51]],rematchDialog:["The dragon's soul burns eternal, {name}!"],aiLevel:AI_GYM});
  m.npcs.push({x:10,y:11,type:"healer",name:"Nurse Joy",dialog:["Welcome, {name}!","Let me heal your Minis!"],facing:"up"});
  m.npcs.push({x:6,y:10,type:"trainer",name:"Wyvern",dialog:["My Dragon moves are fierce!"],facing:"right",defeated:false,party:[[27,36],[37,35]],rematchParty:[[27,52],[37,51],[58,50]],rematchDialog:["The dragon's fury is absolute!"],aiLevel:AI_ELITE});
  m.npcs.push({x:14,y:8,type:"item_giver",name:"Dragon Master",dialog:["Only the worthy carry this TM!"],facing:"down",give_item:I_TM_DCLAW,give_count:1,gave_item:false});
  m.npcs.push({x:8,y:8,type:"talker",name:"Arena Spectator",dialog:["This colosseum has hosted battles for centuries!","May the best trainer win!"]});
  m.npcs.push({x:13,y:14,type:"talker",name:"Dragon Breeder",dialog:["I raise dragons here.","They respond to a strong bond!"]});
  m.signs.push({x:12,y:10,text:"Grand Colosseum - Where legends clash!"});
  return m;
}

function createElite4Hall(){
  const m=makeMap(20,20,"Elite Four Hall",0.0);
  fillBorder(m,TILE_ROCK);fillRect(m,3,3,16,16,TILE_PATH);
  setT(m,10,0,TILE_DOOR);m.doors.push({x:10,y:0,dest:9,destX:10,destY:18});
  setT(m,10,19,TILE_DOOR);m.doors.push({x:10,y:19,dest:11,destX:10,destY:1});
  setT(m,10,10,TILE_HEAL);
  m.npcs.push({x:10,y:11,type:"healer",name:"Nurse Joy",dialog:["Welcome, {name}!","Let me heal your Minis for the challenges ahead!"],facing:"up"});
  m.npcs.push({x:10,y:5,type:"trainer",name:"Elite Aria",dialog:["I am Aria of the Elite Four!","Welcome, {name}!","My melodies shall console you!"],facing:"down",defeated:false,party:[[44,50],[54,49],[64,48]],reward:12000,rematchParty:[[44,68],[54,67],[64,66],[72,65]],rematchDialog:["My symphony has reached new heights, {name}!"],aiLevel:AI_ELITE});
  m.npcs.push({x:5,y:10,type:"trainer",name:"Elite Terra",dialog:["I am Terra of the Elite Four!","Welcome, {name}!","The earth trembles before me!"],facing:"right",defeated:false,party:[[45,52],[55,51],[65,50]],reward:12000,rematchParty:[[45,70],[55,69],[65,68],[74,67]],rematchDialog:["The earth's fury is boundless, {name}!"],aiLevel:AI_ELITE});
  m.npcs.push({x:15,y:10,type:"trainer",name:"Elite Umbra",dialog:["I am Umbra of the Elite Four!","Welcome, {name}!","Shadow and nightmare!"],facing:"left",defeated:false,party:[[46,54],[56,53],[66,52]],reward:12000,rematchParty:[[46,72],[56,71],[66,70],[68,69]],rematchDialog:["The void beckons you, {name}!"],aiLevel:AI_ELITE});
  m.npcs.push({x:10,y:15,type:"trainer",name:"Elite Sol",dialog:["I am Sol of the Elite Four!","Welcome, {name}!","Radiance purifies all!"],facing:"up",defeated:false,party:[[47,56],[57,55],[67,54]],reward:12000,rematchParty:[[47,74],[57,73],[67,72],[80,71]],rematchDialog:["The light of dawn is blinding, {name}!"],aiLevel:AI_ELITE});
  m.signs.push({x:12,y:10,text:"Elite Four Hall - Only the worthy may pass!"});
  return m;
}

function createChampionArena(){
  const m=makeMap(20,20,"Champion Arena",0.0);
  fillBorder(m,TILE_ROCK);fillRect(m,4,4,15,15,TILE_PATH);
  setT(m,10,0,TILE_DOOR);m.doors.push({x:10,y:0,dest:10,destX:10,destY:18});
  setT(m,10,12,TILE_HEAL);
  m.npcs.push({x:10,y:13,type:"healer",name:"Nurse Joy",dialog:["Welcome, {name}!","Heal up before the final battle!"],facing:"up"});
  m.npcs.push({x:10,y:8,type:"trainer",name:"Champion Zenith",dialog:["I am Zenith, the Champion!","Welcome, {name}!","You have journeyed far. Let us see if you are truly worthy!"],facing:"down",defeated:false,party:[[48,60],[58,59],[68,58],[78,57],[1,55],[21,55]],reward:50000,rematchParty:[[60,80],[58,79],[68,78],[78,77],[52,76],[88,75]],rematchDialog:["You've returned, {name}! Let our bond decide the true champion!"],aiLevel:AI_CHAMPION});
  m.signs.push({x:12,y:10,text:"Champion Arena - The Final Battle!"});
  return m;
}

// ===== INTERIOR MAPS =====
const INTERIOR_MAPS_START = 12;

function createPokemonCenterInterior(exteriorMapIdx, exitX, exitY){
  const m=makeMap(12,10,"Pokémon Center",0.0);
  // Floor
  fillRect(m,0,0,11,9,TILE_GROUND);
  // Walls
  for(let x=0;x<12;x++){setT(m,x,0,TILE_WALL);setT(m,x,9,TILE_WALL);}
  for(let y=0;y<10;y++){setT(m,0,y,TILE_WALL);setT(m,11,y,TILE_WALL);}
  // Counter
  fillRect(m,2,2,9,3,TILE_WALL);
  // Healing machine
  setT(m,5,3,TILE_HEAL);setT(m,6,3,TILE_HEAL);
  // Nurse Joy behind counter
  m.npcs.push({x:5,y:3,type:"healer",name:"Nurse Joy",dialog:["Welcome to the Pokémon Center!","Would you like me to heal your Minis?"],facing:"down"});
  m.npcs.push({x:6,y:3,type:"healer",name:"Nurse Joy",dialog:["Welcome to the Pokémon Center!","Would you like me to heal your Minis?"],facing:"down"});
  // PCs
  setT(m,2,2,TILE_SHOP);setT(m,9,2,TILE_SHOP);
  // Chairs
  fillRect(m,2,5,3,3,TILE_GROUND);
  fillRect(m,7,5,3,3,TILE_GROUND);
  // Exit door at bottom center
  setT(m,5,9,TILE_DOOR);setT(m,6,9,TILE_DOOR);
  m.doors.push({x:5,y:9,dest:exteriorMapIdx,destX:exitX,destY:exitY});
  m.doors.push({x:6,y:9,dest:exteriorMapIdx,destX:exitX,destY:exitY});
  return m;
}

function createMartInterior(exteriorMapIdx, exitX, exitY){
  const m=makeMap(12,10,"Poké Mart",0.0);
  fillRect(m,0,0,11,9,TILE_GROUND);
  for(let x=0;x<12;x++){setT(m,x,0,TILE_WALL);setT(m,x,9,TILE_WALL);}
  for(let y=0;y<10;y++){setT(m,0,y,TILE_WALL);setT(m,11,y,TILE_WALL);}
  // Counter
  fillRect(m,2,2,9,3,TILE_WALL);
  // Clerk
  m.npcs.push({x:5,y:3,type:"item_giver",name:"Clerk",dialog:["Welcome to the Poké Mart!","Can I help you find something?"],facing:"down"});
  m.npcs.push({x:6,y:3,type:"item_giver",name:"Clerk",dialog:["Welcome to the Poké Mart!","Can I help you find something?"],facing:"down"});
  // Shelves
  fillRect(m,2,5,9,4,TILE_WALL);
  // Exit
  setT(m,5,9,TILE_DOOR);setT(m,6,9,TILE_DOOR);
  m.doors.push({x:5,y:9,dest:exteriorMapIdx,destX:exitX,destY:exitY});
  m.doors.push({x:6,y:9,dest:exteriorMapIdx,destX:exitX,destY:exitY});
  return m;
}

function createGymInterior(exteriorMapIdx, exitX, exitY, leaderName, leaderType, leaderParty, badgeName){
  const m=makeMap(14,12,"Gym",0.0);
  fillRect(m,0,0,13,11,TILE_GROUND);
  for(let x=0;x<14;x++){setT(m,x,0,TILE_WALL);setT(m,x,11,TILE_WALL);}
  for(let y=0;y<12;y++){setT(m,0,y,TILE_WALL);setT(m,13,y,TILE_WALL);}
  // Gym leader at top
  m.npcs.push({x:7,y:2,type:"gym_leader",name:leaderName,dialog:["I am the Leader of this Gym!","Let's battle!"],facing:"down",defeated:false,party:leaderParty,badge:badgeName,reward:3000,aiLevel:AI_GYM});
  // Statues/trophies
  setT(m,3,2,TILE_SIGN);setT(m,10,2,TILE_SIGN);
  // Exit
  setT(m,6,11,TILE_DOOR);setT(m,7,11,TILE_DOOR);
  m.doors.push({x:6,y:11,dest:exteriorMapIdx,destX:exitX,destY:exitY});
  m.doors.push({x:7,y:11,dest:exteriorMapIdx,destX:exitX,destY:exitY});
  return m;
}

function createHouseInterior(exteriorMapIdx, exitX, exitY, npcData){
  const m=makeMap(10,8,"House",0.0);
  fillRect(m,0,0,9,7,TILE_GROUND);
  for(let x=0;x<10;x++){setT(m,x,0,TILE_WALL);setT(m,x,7,TILE_WALL);}
  for(let y=0;y<8;y++){setT(m,0,y,TILE_WALL);setT(m,9,y,TILE_WALL);}
  // NPC inside
  if(npcData){
    m.npcs.push({x:5,y:3,type:npcData.type,name:npcData.name,dialog:npcData.dialog,facing:"down",give_item:npcData.give_item,give_count:npcData.give_count,gave_item:false});
  }
  // Furniture
  setT(m,2,2,TILE_SHOP);setT(m,7,2,TILE_SHOP);
  setT(m,2,5,TILE_SHOP);setT(m,7,5,TILE_SHOP);
  // Exit
  setT(m,4,7,TILE_DOOR);setT(m,5,7,TILE_DOOR);
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
