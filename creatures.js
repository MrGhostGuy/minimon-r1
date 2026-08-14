// Minimon - Creatures Database (100 creatures)
const CREATURES={};

function addC(dex,nm,types,hp,atk,def,spd,satk,sdef,moves,evo,cr,gr,col,col2){
  CREATURES[dex]={dex,name:nm,types,baseStats:[hp,atk,def,spd,satk,sdef],moves:moves||[],
  evo:evo||null,catchRate:cr||45,growthRate:gr||GROWTH_MEDIUM,color:col||[200,200,200],color2:col2||null};
}

// ===== STARTERS =====
addC(1,"Emberpup",[TYPE_FIRE],45,52,40,60,48,42,
  [[1,"scratch"],[1,"growl"],[6,"ember"],[10,"bite"],[15,"flame_fang"],[20,"crunch"],
   [25,"flamethrower"],[30,"fire_fang"],[35,"blaze_fury"]],
  [16,4],45,GROWTH_MEDIUM,[240,120,40],[255,180,60]);
addC(4,"Infernash",[TYPE_FIRE,TYPE_DARK],70,78,55,85,72,58,
  [[1,"ember"],[1,"crunch"],[1,"flame_fang"],[30,"dark_pulse"],[35,"blaze_fury"],
   [40,"flamethrower"],[45,"shadow_claw"],[50,"inferno"]],
  null,45,GROWTH_MEDIUM,[200,60,30],[255,100,30]);

addC(2,"Aquapup",[TYPE_WATER],50,45,55,48,52,48,
  [[1,"tackle"],[1,"tail_whip"],[6,"water_gun"],[10,"bite"],[15,"aqua_jet"],
   [20,"bubble_beam"],[25,"crunch"],[30,"hydro_pump"]],
  [16,5],45,GROWTH_MEDIUM,[60,140,240],[60,180,255]);
addC(5,"Tidaloom",[TYPE_WATER,TYPE_DRAGON],85,68,72,65,80,68,
  [[1,"water_gun"],[1,"crunch"],[1,"aqua_jet"],[30,"dragon_pulse"],[35,"bubble_beam"],
   [40,"hydro_pump"],[45,"dragon_dance"],[50,"tidal_wave"]],
  null,45,GROWTH_MEDIUM,[40,100,200],[30,100,255]);

addC(3,"Sproutling",[TYPE_GRASS],48,42,55,45,50,52,
  [[1,"tackle"],[1,"growl"],[5,"vine_whip"],[9,"leech_seed"],[13,"sleep_powder"],[17,"razor_leaf"],
   [21,"seed_bomb"],[25,"giga_drain"],[30,"solar_beam"]],
  [16,6],45,GROWTH_MEDIUM,[80,200,80],[120,255,80]);
addC(6,"Terralith",[TYPE_GRASS,TYPE_EARTH],90,70,85,50,65,78,
  [[1,"vine_whip"],[1,"leech_seed"],[1,"earthquake"],[30,"seed_bomb"],
   [35,"giga_drain"],[40,"stone_edge"],[45,"protect"],[50,"forest_wrath"]],
  null,45,GROWTH_MEDIUM,[60,160,60],[80,200,60]);

// ===== EARLY ROUTE =====
addC(7,"Flutterwisp",[TYPE_WIND],35,30,25,55,35,30,
  [[1,"gust"],[5,"quick_attack"],[10,"tailwind"],[15,"air_slash"]],
  [20,8],45,GROWTH_FAST,[180,220,255],[200,240,255]);
addC(8,"Galewing",[TYPE_WIND,TYPE_LIGHT],65,55,50,85,60,55,
  [[1,"air_slash"],[1,"quick_attack"],[25,"dazzling_gleam"],[30,"hurricane"],
   [35,"brave_bird"]],
  null,45,GROWTH_MEDIUM,[200,230,255],[220,240,255]);

addC(9,"Burrowmole",[TYPE_EARTH],40,45,50,30,25,35,
  [[1,"scratch"],[5,"dig"],[10,"mud_slap"],[15,"rock_throw"]],
  [22,10],45,GROWTH_FAST,[160,120,70],[180,140,90]);
addC(10,"Diggernaut",[TYPE_EARTH,TYPE_NORMAL],75,80,70,45,40,55,
  [[1,"dig"],[1,"rock_throw"],[25,"earthquake"],[30,"stone_edge"],
   [35,"iron_tail"],[40,"earthquake"]],
  null,45,GROWTH_MEDIUM,[140,100,60],[160,120,80]);

addC(11,"Sparkitten",[TYPE_ELECTRIC],38,42,30,58,40,32,
  [[1,"scratch"],[1,"growl"],[5,"thundershock"],[10,"quick_attack"],
   [15,"spark"],[20,"thunder_fang"]],
  [22,12],45,GROWTH_FAST,[250,230,60],[255,240,80]);
addC(12,"Voltraith",[TYPE_ELECTRIC,TYPE_DARK],70,72,50,90,65,52,
  [[1,"spark"],[1,"thunder_fang"],[25,"dark_pulse"],[30,"thunderbolt"],
   [35,"shadow_claw"],[40,"thunder"]],
  null,45,GROWTH_MEDIUM,[220,200,40],[100,255,100]);

addC(13,"Frostkit",[TYPE_ICE],40,38,35,48,42,40,
  [[1,"scratch"],[1,"tail_whip"],[5,"ice_shard"],[10,"icy_wind"],
   [15,"frost_bite"]],
  [22,14],45,GROWTH_FAST,[160,220,240],[180,240,255]);
addC(14,"Glacius",[TYPE_ICE,TYPE_WIND],72,58,55,78,70,65,
  [[1,"ice_shard"],[1,"icy_wind"],[25,"blizzard"],[30,"air_slash"],
   [35,"ice_beam"],[40,"blizzard"]],
  null,45,GROWTH_MEDIUM,[140,200,230],[100,180,220]);

addC(15,"Shadeling",[TYPE_DARK],38,45,30,50,35,28,
  [[1,"scratch"],[1,"leer"],[5,"bite"],[9,"toxic"],
   [13,"pursuit"],[17,"shadow_sneak"]],
  [24,16],45,GROWTH_FAST,[80,60,100],[160,80,200]);
addC(16,"Duskfang",[TYPE_DARK,TYPE_SPIRIT],68,78,50,80,55,48,
  [[1,"bite"],[1,"shadow_sneak"],[25,"shadow_claw"],[30,"dark_pulse"],
   [35,"crunch"],[40,"nasty_plot"],[45,"shadow_blast"]],
  null,45,GROWTH_MEDIUM,[60,40,80],[120,60,160]);

addC(17,"Lumibug",[TYPE_LIGHT],32,25,28,40,45,40,
  [[1,"tackle"],[5,"flash"],[10,"confuse_ray"],[15,"dazzling_gleam"]],
  [18,18],45,GROWTH_FAST,[255,255,150],[255,255,200]);
addC(18,"Radiantis",[TYPE_LIGHT,TYPE_WIND],62,48,50,75,78,70,
  [[1,"dazzling_gleam"],[1,"flash"],[20,"air_slash"],[25,"solar_beam"],
   [30,"moonlight"],[35,"bug_buzz"]],
  null,45,GROWTH_MEDIUM,[255,255,180],[255,255,220]);

addC(19,"Pebblit",[TYPE_EARTH,TYPE_NORMAL],42,48,55,25,22,30,
  [[1,"tackle"],[5,"rock_throw"],[10,"harden"],[15,"rock_slide"]],
  [25,20],45,GROWTH_FAST,[180,160,140],[200,180,160]);
addC(20,"Boulderon",[TYPE_EARTH],85,90,100,30,35,50,
  [[1,"rock_throw"],[1,"harden"],[25,"rock_slide"],[30,"earthquake"],
   [35,"stone_edge"],[40,"hyper_beam"]],
  null,45,GROWTH_MEDIUM,[150,130,110],[170,150,130]);

addC(21,"Pondling",[TYPE_WATER],40,35,40,38,42,45,
  [[1,"water_gun"],[5,"tackle"],[10,"bubble"],[15,"water_pulse"]],
  [20,22],45,GROWTH_FAST,[80,160,200],[100,180,220]);
addC(22,"Nessiel",[TYPE_WATER,TYPE_SPIRIT],78,55,60,60,72,75,
  [[1,"water_pulse"],[1,"bubble"],[25,"shadow_ball"],[30,"hydro_pump"],
   [35,"rest"],[40,"ice_beam"]],
  null,45,GROWTH_MEDIUM,[60,120,180],[80,140,200]);

addC(23,"Wispflame",[TYPE_FIRE,TYPE_SPIRIT],35,40,30,50,48,35,
  [[1,"ember"],[1,"spite"],[5,"fire_spin"],[10,"will_o_wisp"],
   [15,"flame_wheel"]],
  [25,24],45,GROWTH_FAST,[240,140,60],[255,180,80]);
addC(24,"Infernospirit",[TYPE_FIRE,TYPE_SPIRIT],70,65,50,80,78,55,
  [[1,"flame_wheel"],[1,"shadow_ball"],[25,"flamethrower"],[30,"shadow_claw"],
   [35,"blaze_fury"],[40,"shadow_blast"]],
  null,45,GROWTH_MEDIUM,[220,100,40],[240,140,60]);

addC(25,"Thornling",[TYPE_GRASS,TYPE_DARK],42,50,55,35,38,40,
  [[1,"vine_whip"],[1,"leer"],[5,"stun_spore"],[9,"razor_leaf"],
   [13,"poison_sting"],[17,"pin_missile"],[21,"seed_bomb"]],
  [28,26],45,GROWTH_FAST,[80,140,60],[100,180,80]);
addC(26,"Briarvain",[TYPE_GRASS,TYPE_DARK],78,80,75,55,60,62,
  [[1,"razor_leaf"],[1,"crunch"],[25,"seed_bomb"],[30,"dark_pulse"],
   [35,"giga_drain"],[40,"wood_hammer"]],
  null,45,GROWTH_MEDIUM,[50,120,40],[60,160,50]);

addC(27,"Zappling",[TYPE_ELECTRIC,TYPE_GRASS],38,40,32,52,45,35,
  [[1,"thundershock"],[1,"vine_whip"],[5,"spark"],[10,"leech_seed"],
   [15,"thunder_wave"]],
  [25,28],45,GROWTH_FAST,[200,220,60],[220,240,80]);
addC(28,"Voltvine",[TYPE_ELECTRIC,TYPE_GRASS],72,68,55,82,75,58,
  [[1,"spark"],[1,"giga_drain"],[25,"thunderbolt"],[30,"seed_bomb"],
   [35,"thunder"],[40,"solar_beam"]],
  null,45,GROWTH_MEDIUM,[180,200,40],[200,220,60]);

addC(29,"Sandswirl",[TYPE_EARTH,TYPE_WIND],38,42,38,48,35,32,
  [[1,"mud_slap"],[1,"gust"],[5,"sand_attack"],[10,"dig"],
   [15,"air_slash"]],
  [25,30],45,GROWTH_FAST,[210,190,130],[230,210,150]);
addC(30,"Dustvortex",[TYPE_EARTH,TYPE_WIND],72,65,60,85,55,52,
  [[1,"dig"],[1,"air_slash"],[25,"earthquake"],[30,"hurricane"],
   [35,"sandstorm"],[40,"fissure"]],
  null,45,GROWTH_MEDIUM,[190,170,110],[210,190,130]);

addC(31,"Coralbit",[TYPE_WATER,TYPE_LIGHT],42,35,48,38,45,50,
  [[1,"water_gun"],[1,"flash"],[5,"bubble"],[10,"confuse_ray"],
   [15,"dazzling_gleam"]],
  [25,32],45,GROWTH_FAST,[100,200,220],[120,220,240]);
addC(32,"Reefguard",[TYPE_WATER,TYPE_LIGHT],80,55,80,55,72,78,
  [[1,"bubble_beam"],[1,"dazzling_gleam"],[25,"hydro_pump"],[30,"moonlight"],
   [35,"ice_beam"],[40,"aurora_beam"]],
  null,45,GROWTH_MEDIUM,[80,180,200],[100,200,220]);

// ===== MID-GAME =====
addC(33,"Gloomoth",[TYPE_DARK,TYPE_NORMAL],50,55,40,45,42,38,
  [[1,"bite"],[1,"poison_sting"],[5,"confuse_ray"],[10,"pursuit"],
   [15,"sludge_bomb"],[20,"dark_pulse"]],
  [30,34],45,GROWTH_MEDIUM,[120,80,140],[140,100,160]);
addC(34,"Dreadmoth",[TYPE_DARK,TYPE_WIND],80,78,58,72,65,55,
  [[1,"dark_pulse"],[1,"air_slash"],[30,"shadow_claw"],[35,"hurricane"],
   [40,"bug_buzz"],[45,"shadow_blast"]],
  null,45,GROWTH_MEDIUM,[100,60,120],[120,80,140]);

addC(35,"Ironclad",[TYPE_NORMAL,TYPE_EARTH],65,80,90,35,30,55,
  [[1,"tackle"],[1,"harden"],[5,"iron_head"],[10,"rock_throw"],
   [15,"metal_claw"],[20,"iron_tail"],[25,"rock_slide"],[30,"earthquake"]],
  [35,36],45,GROWTH_MEDIUM,[140,140,160],[160,160,180]);
addC(36,"Titanforge",[TYPE_NORMAL,TYPE_EARTH],95,100,110,40,45,70,
  [[1,"iron_tail"],[1,"earthquake"],[35,"stone_edge"],[40,"hyper_beam"],
   [45,"iron_head"],[50,"megahorn"]],
  null,45,GROWTH_MEDIUM,[120,120,140],[140,140,160]);

addC(37,"Frosthorn",[TYPE_ICE,TYPE_NORMAL],60,65,55,55,50,50,
  [[1,"ice_shard"],[1,"tackle"],[5,"frost_bite"],[10,"horn_attack"],
   [15,"ice_fang"],[20,"megahorn"]],
  [32,38],45,GROWTH_MEDIUM,[140,200,220],[160,220,240]);
addC(38,"Glacitaur",[TYPE_ICE,TYPE_DARK],88,85,70,70,60,65,
  [[1,"ice_fang"],[1,"crunch"],[30,"ice_beam"],[35,"dark_pulse"],
   [40,"blizzard"],[45,"shadow_claw"]],
  null,45,GROWTH_MEDIUM,[100,160,190],[120,180,210]);

addC(39,"Emberscale",[TYPE_FIRE,TYPE_DRAGON],55,60,48,52,55,45,
  [[1,"ember"],[1,"bite"],[5,"dragon_rage"],[10,"flame_wheel"],
   [15,"dragon_claw"],[20,"flamethrower"]],
  [35,40],45,GROWTH_MEDIUM,[220,80,40],[255,120,60]);
addC(40,"Drakonfire",[TYPE_FIRE,TYPE_DRAGON],88,85,68,78,80,65,
  [[1,"flamethrower"],[1,"dragon_claw"],[35,"dragon_pulse"],[40,"fire_blast"],
   [45,"outrage"],[50,"blaze_fury"]],
  null,45,GROWTH_MEDIUM,[200,60,30],[240,100,40]);

addC(41,"Tidecrest",[TYPE_WATER,TYPE_DRAGON],58,55,55,50,60,55,
  [[1,"water_gun"],[1,"dragon_rage"],[5,"water_pulse"],[10,"dragon_claw"],
   [15,"aqua_jet"],[20,"crunch"]],
  [35,42],45,GROWTH_MEDIUM,[50,120,200],[70,140,220]);
addC(42,"Leviathorn",[TYPE_WATER,TYPE_DRAGON],92,72,75,70,82,72,
  [[1,"hydro_pump"],[1,"dragon_pulse"],[35,"ice_beam"],[40,"dragon_dance"],
   [45,"tidal_wave"],[50,"outrage"]],
  null,45,GROWTH_MEDIUM,[30,90,170],[50,110,190]);

addC(43,"Leafshade",[TYPE_GRASS,TYPE_SPIRIT],52,48,50,48,58,55,
  [[1,"vine_whip"],[1,"spite"],[5,"leech_seed"],[10,"shadow_ball"],
   [15,"giga_drain"],[20,"will_o_wisp"]],
  [32,44],45,GROWTH_MEDIUM,[60,180,100],[80,200,120]);
addC(44,"Spirifleur",[TYPE_GRASS,TYPE_SPIRIT],82,60,68,65,80,78,
  [[1,"giga_drain"],[1,"shadow_ball"],[30,"solar_beam"],[35,"shadow_claw"],
   [40,"moonlight"],[45,"forest_wrath"]],
  null,45,GROWTH_MEDIUM,[40,160,80],[60,180,100]);

addC(45,"Sparkviper",[TYPE_ELECTRIC,TYPE_DARK],50,62,40,65,55,38,
  [[1,"thundershock"],[1,"bite"],[5,"spark"],[10,"pursuit"],
   [15,"thunder_fang"],[20,"crunch"]],
  [30,46],45,GROWTH_MEDIUM,[200,180,40],[220,200,60]);
addC(46,"Voltsnake",[TYPE_ELECTRIC,TYPE_DARK],78,85,55,90,72,52,
  [[1,"thunder_fang"],[1,"crunch"],[30,"thunderbolt"],[35,"dark_pulse"],
   [40,"thunder"],[45,"shadow_claw"]],
  null,45,GROWTH_MEDIUM,[180,160,20],[200,180,40]);

addC(47,"Crystalwing",[TYPE_ICE,TYPE_WIND],55,50,48,62,60,55,
  [[1,"ice_shard"],[1,"gust"],[5,"icy_wind"],[10,"air_slash"],
   [15,"frost_bite"],[20,"blizzard"]],
  [32,48],45,GROWTH_MEDIUM,[160,220,240],[180,240,255]);
addC(48,"Auroragon",[TYPE_ICE,TYPE_LIGHT],85,65,68,82,82,75,
  [[1,"ice_beam"],[1,"dazzling_gleam"],[30,"blizzard"],[35,"air_slash"],
   [40,"aurora_beam"],[45,"moonlight"]],
  null,45,GROWTH_MEDIUM,[140,200,230],[160,220,255]);

addC(49,"Flametail",[TYPE_FIRE,TYPE_NORMAL],48,55,42,65,45,38,
  [[1,"ember"],[1,"quick_attack"],[5,"fire_spin"],[10,"flame_wheel"],
   [15,"agility"],[20,"flamethrower"]],
  [28,50],45,GROWTH_MEDIUM,[250,160,60],[255,200,100]);
addC(50,"Solarfox",[TYPE_FIRE,TYPE_LIGHT],78,75,58,92,70,55,
  [[1,"flamethrower"],[1,"dazzling_gleam"],[28,"fire_blast"],[35,"quick_attack"],
   [40,"solar_beam"],[45,"extreme_speed"]],
  null,45,GROWTH_MEDIUM,[240,140,40],[255,240,140]);

addC(51,"Bulktank",[TYPE_EARTH,TYPE_NORMAL],70,75,80,35,32,55,
  [[1,"tackle"],[1,"harden"],[5,"mud_slap"],[10,"rock_throw"],
   [15,"iron_head"],[20,"earthquake"]],
  [30,52],45,GROWTH_MEDIUM,[170,140,100],[190,160,120]);
addC(52,"Megadrill",[TYPE_EARTH,TYPE_ELECTRIC],95,105,95,45,40,65,
  [[1,"earthquake"],[1,"iron_head"],[30,"stone_edge"],[35,"thunder"],
   [40,"megahorn"],[45,"fissure"]],
  null,45,GROWTH_MEDIUM,[150,120,80],[170,140,100]);

addC(53,"Mistral",[TYPE_WIND,TYPE_SPIRIT],55,45,42,70,62,55,
  [[1,"gust"],[1,"spite"],[5,"confuse_ray"],[10,"air_slash"],
   [15,"shadow_ball"],[20,"will_o_wisp"]],
  [32,54],45,GROWTH_MEDIUM,[170,190,220],[190,210,240]);
addC(54,"Phantastorm",[TYPE_WIND,TYPE_SPIRIT],82,58,55,95,85,72,
  [[1,"hurricane"],[1,"shadow_blast"],[30,"shadow_ball"],[35,"air_slash"],
   [40,"shadow_claw"],[45,"moonlight"]],
  null,45,GROWTH_MEDIUM,[140,160,200],[160,180,220]);

addC(55,"Magmaclaw",[TYPE_FIRE,TYPE_EARTH],55,65,50,48,52,42,
  [[1,"ember"],[1,"scratch"],[5,"mud_slap"],[10,"fire_fang"],
   [15,"rock_throw"],[20,"earthquake"]],
  [30,56],45,GROWTH_MEDIUM,[200,100,40],[220,140,60]);
addC(56,"Infernolith",[TYPE_FIRE,TYPE_EARTH],88,90,75,62,68,60,
  [[1,"earthquake"],[1,"flamethrower"],[30,"stone_edge"],[35,"fire_blast"],
   [40,"iron_tail"],[45,"inferno"]],
  null,45,GROWTH_MEDIUM,[180,80,30],[200,120,50]);

// ===== LATE GAME =====
addC(57,"Voidmaw",[TYPE_DARK,TYPE_DRAGON],70,82,58,68,72,50,
  [[1,"bite"],[1,"dragon_rage"],[5,"dark_pulse"],[10,"dragon_claw"],
   [15,"crunch"],[20,"dragon_pulse"],[25,"shadow_claw"],[30,"outrage"]],
  [40,58],45,GROWTH_SLOW,[80,40,100],[100,60,120]);
addC(58,"Abyssaldrake",[TYPE_DARK,TYPE_DRAGON],100,105,75,85,92,68,
  [[1,"dragon_pulse"],[1,"shadow_claw"],[40,"outrage"],[45,"shadow_blast"],
   [50,"dark_pulse"],[55,"dragon_dance"],[60,"inferno"]],
  null,45,GROWTH_SLOW,[60,20,80],[80,40,100]);

addC(59,"Celestine",[TYPE_LIGHT,TYPE_DRAGON],75,60,65,70,85,80,
  [[1,"dazzling_gleam"],[1,"dragon_rage"],[5,"flash"],[10,"dragon_claw"],
   [15,"solar_beam"],[20,"moonlight"],[25,"dragon_pulse"]],
  [40,60],45,GROWTH_SLOW,[255,240,200],[255,250,220]);
addC(60,"Astraldrake",[TYPE_LIGHT,TYPE_DRAGON],105,78,82,88,110,95,
  [[1,"dragon_pulse"],[1,"solar_beam"],[40,"moonlight"],[45,"outrage"],
   [50,"aurora_beam"],[55,"dazzling_gleam"],[60,"hyper_beam"]],
  null,45,GROWTH_SLOW,[255,220,160],[255,240,200]);

addC(61,"Stoneheart",[TYPE_EARTH,TYPE_LIGHT],68,72,85,42,55,72,
  [[1,"rock_throw"],[1,"flash"],[5,"harden"],[10,"rock_slide"],
   [15,"iron_head"],[20,"dazzling_gleam"],[25,"stone_edge"]],
  [38,62],45,GROWTH_MEDIUM,[200,180,140],[220,200,160]);
addC(62,"Golemsolar",[TYPE_EARTH,TYPE_LIGHT],100,92,108,50,72,88,
  [[1,"stone_edge"],[1,"solar_beam"],[38,"earthquake"],[45,"iron_head"],
   [50,"moonlight"],[55,"hyper_beam"],[60,"fissure"]],
  null,45,GROWTH_MEDIUM,[180,160,120],[200,180,140]);

addC(63,"Tempestrix",[TYPE_WIND,TYPE_ELECTRIC],65,55,50,90,78,62,
  [[1,"gust"],[1,"thundershock"],[5,"tailwind"],[10,"spark"],
   [15,"air_slash"],[20,"thunderbolt"],[25,"hurricane"],[30,"thunder"]],
  [38,64],45,GROWTH_MEDIUM,[180,210,250],[200,230,255]);
addC(64,"Stormwing",[TYPE_WIND,TYPE_ELECTRIC],95,72,68,108,98,78,
  [[1,"hurricane"],[1,"thunder"],[38,"air_slash"],[45,"thunderbolt"],
   [50,"dazzling_gleam"],[55,"brave_bird"],[60,"extreme_speed"]],
  null,45,GROWTH_MEDIUM,[160,190,240],[180,210,255]);

addC(65,"Frostwyrm",[TYPE_ICE,TYPE_DRAGON],82,72,65,70,78,68,
  [[1,"ice_shard"],[1,"dragon_rage"],[5,"frost_bite"],[10,"dragon_claw"],
   [15,"ice_beam"],[20,"dragon_pulse"],[25,"blizzard"],[30,"dragon_dance"]],
  [42,66],45,GROWTH_SLOW,[120,180,220],[140,200,240]);
addC(66,"Cryodrake",[TYPE_ICE,TYPE_DRAGON],108,88,82,85,95,82,
  [[1,"blizzard"],[1,"dragon_pulse"],[42,"ice_beam"],[48,"outrage"],
   [52,"dragon_dance"],[55,"hydro_pump"],[60,"hyper_beam"]],
  null,45,GROWTH_SLOW,[100,160,200],[120,180,220]);

addC(67,"Nightmare",[TYPE_DARK,TYPE_SPIRIT],72,68,55,78,80,62,
  [[1,"shadow_ball"],[1,"dark_pulse"],[5,"confuse_ray"],[10,"shadow_claw"],
   [15,"night_shade"],[20,"pursuit"],[25,"shadow_blast"],[30,"nasty_plot"]],
  [38,68],45,GROWTH_MEDIUM,[70,40,90],[90,60,110]);
addC(68,"Phantasmal",[TYPE_DARK,TYPE_SPIRIT],102,82,70,98,102,78,
  [[1,"shadow_blast"],[1,"nasty_plot"],[38,"dark_pulse"],[45,"shadow_claw"],
   [50,"shadow_ball"],[55,"crunch"],[60,"night_shade"]],
  null,45,GROWTH_MEDIUM,[50,20,70],[70,40,90]);

addC(69,"Blazewolf",[TYPE_FIRE,TYPE_DARK],68,78,55,72,62,48,
  [[1,"ember"],[1,"bite"],[5,"fire_fang"],[10,"pursuit"],
   [15,"flame_wheel"],[20,"crunch"],[25,"flamethrower"],[30,"dark_pulse"]],
  [36,70],45,GROWTH_MEDIUM,[220,100,40],[255,140,60]);
addC(70,"Infernolf",[TYPE_FIRE,TYPE_DARK],95,102,68,88,78,62,
  [[1,"flamethrower"],[1,"dark_pulse"],[36,"fire_blast"],[42,"crunch"],
   [45,"shadow_claw"],[50,"blaze_fury"],[55,"inferno"]],
  null,45,GROWTH_MEDIUM,[200,80,20],[240,120,40]);

addC(71,"Seraphwing",[TYPE_LIGHT,TYPE_WIND],72,55,60,82,85,78,
  [[1,"dazzling_gleam"],[1,"gust"],[5,"flash"],[10,"air_slash"],
   [15,"moonlight"],[20,"solar_beam"],[25,"hurricane"],[30,"aurora_beam"]],
  [38,72],45,GROWTH_MEDIUM,[255,250,220],[255,255,240]);
addC(72,"Seraphdrake",[TYPE_LIGHT,TYPE_DRAGON],102,72,78,95,105,92,
  [[1,"dragon_pulse"],[1,"solar_beam"],[38,"moonlight"],[45,"outrage"],
   [50,"hurricane"],[55,"dazzling_gleam"],[60,"hyper_beam"]],
  null,45,GROWTH_MEDIUM,[255,240,200],[255,250,220]);

addC(73,"Warhammer",[TYPE_NORMAL,TYPE_EARTH],90,100,95,45,42,65,
  [[1,"hammer_arm"],[1,"harden"],[5,"mud_slap"],[10,"iron_head"],
   [15,"rock_slide"],[20,"earthquake"],[25,"megahorn"],[30,"stone_edge"]],
  [42,74],45,GROWTH_SLOW,[160,140,120],[180,160,140]);
addC(74,"Titanclash",[TYPE_NORMAL,TYPE_EARTH],120,118,110,50,50,80,
  [[1,"earthquake"],[1,"stone_edge"],[42,"hyper_beam"],[48,"iron_head"],
   [52,"megahorn"],[55,"fissure"],[60,"hammer_arm"]],
  null,45,GROWTH_SLOW,[140,120,100],[160,140,120]);

// ===== LEGENDARY (boosted stats) =====
addC(75,"Solarius",[TYPE_LIGHT,TYPE_FIRE],100,95,88,100,110,92,
  [[1,"dazzling_gleam"],[1,"ember"],[10,"solar_beam"],[20,"flamethrower"],
   [30,"moonlight"],[40,"fire_blast"],[50,"aurora_beam"],[60,"celestial_nova"]],
  null,3,GROWTH_SLOW,[255,220,80],[255,240,100]);
addC(76,"Lunara",[TYPE_ICE,TYPE_SPIRIT],100,88,92,95,105,98,
  [[1,"ice_shard"],[1,"shadow_ball"],[10,"ice_beam"],[20,"shadow_claw"],
   [30,"moonlight"],[40,"blizzard"],[50,"shadow_blast"],[60,"void_eruption"]],
  null,3,GROWTH_SLOW,[160,180,240],[120,160,255]);
addC(77,"Terrageist",[TYPE_EARTH,TYPE_SPIRIT],105,98,102,80,88,98,
  [[1,"earthquake"],[1,"shadow_ball"],[10,"stone_edge"],[20,"shadow_claw"],
   [30,"fissure"],[40,"shadow_blast"],[50,"iron_head"],[60,"cataclysm"]],
  null,3,GROWTH_SLOW,[120,100,80],[80,160,120]);
addC(78,"Typhollow",[TYPE_WATER,TYPE_DARK],102,90,85,105,98,92,
  [[1,"water_gun"],[1,"bite"],[10,"hydro_pump"],[20,"dark_pulse"],
   [30,"crunch"],[40,"tidal_wave"],[50,"shadow_blast"],[60,"abyssal_geyser"]],
  null,3,GROWTH_SLOW,[30,80,160],[20,120,200]);
addC(79,"Stormheart",[TYPE_WIND,TYPE_ELECTRIC],98,96,82,112,102,88,
  [[1,"gust"],[1,"thundershock"],[10,"hurricane"],[20,"thunder"],
   [30,"air_slash"],[40,"thunderbolt"],[50,"dazzling_gleam"],[60,"origin_pulse"]],
  null,3,GROWTH_SLOW,[200,220,255],[220,240,255]);
addC(80,"Ignisoul",[TYPE_FIRE,TYPE_SPIRIT],100,102,85,98,108,85,
  [[1,"ember"],[1,"shadow_ball"],[10,"flamethrower"],[20,"shadow_claw"],
   [30,"blaze_fury"],[40,"fire_blast"],[50,"shadow_blast"],[60,"inferno"]],
  null,3,GROWTH_SLOW,[255,120,60],[255,160,80]);

// ===== RIVAL =====
addC(81,"Aquafang",[TYPE_WATER],48,50,45,55,45,42,
  [[1,"tackle"],[1,"growl"],[6,"water_gun"],[10,"bite"],[15,"aqua_jet"],
   [20,"crunch"],[25,"hydro_pump"],[30,"ice_fang"]],
  [16,83],45,GROWTH_MEDIUM,[50,130,230],[70,150,250]);
addC(82,"Leafclaw",[TYPE_GRASS],48,48,48,52,48,48,
  [[1,"tackle"],[1,"growl"],[6,"vine_whip"],[10,"leech_seed"],[15,"razor_leaf"],
   [20,"seed_bomb"],[25,"giga_drain"],[30,"leaf_blade"]],
  [16,84],45,GROWTH_MEDIUM,[80,190,70],[100,210,90]);
addC(83,"Hydralisk",[TYPE_WATER,TYPE_DRAGON],72,70,62,80,68,58,
  [[1,"water_gun"],[1,"dragon_rage"],[16,"aqua_jet"],[25,"dragon_claw"],
   [30,"hydro_pump"],[35,"crunch"],[40,"ice_fang"]],
  null,45,GROWTH_MEDIUM,[30,100,200],[50,120,220]);
addC(84,"Verdantmaw",[TYPE_GRASS,TYPE_DARK],72,68,65,75,65,62,
  [[1,"vine_whip"],[1,"bite"],[16,"seed_bomb"],[25,"dark_pulse"],
   [30,"giga_drain"],[35,"crunch"],[40,"wood_hammer"]],
  null,45,GROWTH_MEDIUM,[50,150,50],[70,180,70]);

// Dummy
addC(85,"???",[TYPE_NORMAL],99,99,99,99,99,99,
  [[1,"hyper_beam"]],null,0,GROWTH_MEDIUM,[255,255,255]);

// ===== ULTRA-LEGENDARY (dex 86-90) =====
// Extremely powerful, rare, with signature moves
addC(86,"Celestior",[TYPE_LIGHT,TYPE_DRAGON],110,98,95,108,130,105,
  [[1,"dragon_rage"],[1,"flash"],[10,"dragon_claw"],[20,"dazzling_gleam"],
   [30,"dragon_pulse"],[40,"moonlight"],[50,"solar_beam"],[60,"celestial_nova"]],
  null,3,GROWTH_SLOW,[255,255,100],[255,240,60]);
addC(87,"Abyssora",[TYPE_DARK,TYPE_SPIRIT],105,112,88,115,125,95,
  [[1,"shadow_sneak"],[1,"leer"],[10,"dark_pulse"],[20,"shadow_claw"],
   [30,"shadow_ball"],[40,"nasty_plot"],[50,"shadow_blast"],[60,"void_eruption"]],
  null,3,GROWTH_SLOW,[80,40,140],[180,60,255]);
addC(88,"Pyraxis",[TYPE_FIRE,TYPE_DRAGON],100,132,85,115,118,80,
  [[1,"ember"],[1,"dragon_rage"],[10,"dragon_claw"],[20,"flamethrower"],
   [30,"dragon_pulse"],[40,"fire_blast"],[50,"outrage"],[60,"cataclysm"]],
  null,3,GROWTH_SLOW,[255,80,20],[255,120,40]);
addC(89,"Tidalon",[TYPE_WATER,TYPE_DRAGON],125,108,105,90,115,108,
  [[1,"water_gun"],[1,"dragon_rage"],[10,"water_pulse"],[20,"dragon_claw"],
   [30,"hydro_pump"],[40,"dragon_dance"],[50,"tidal_wave"],[60,"abyssal_geyser"]],
  null,3,GROWTH_SLOW,[20,120,255],[40,160,255]);
addC(90,"Mythos",[TYPE_NORMAL,TYPE_DRAGON],108,110,105,108,118,108,
  [[1,"tackle"],[1,"dragon_rage"],[10,"dragon_claw"],[20,"hyper_beam"],
   [30,"dragon_pulse"],[40,"moonlight"],[50,"outrage"],[60,"origin_pulse"]],
  null,3,GROWTH_SLOW,[255,220,255],[255,180,220]);

// ===== NEW CREATURES (91-100) - Filling type gaps =====
// Bug type (missing entirely)
addC(91,"Bugmoth",[TYPE_WIND],35,30,25,40,28,30,
  [[1,"tackle"],[5,"gust"],[9,"pin_missile"],[13,"bug_buzz"],[17,"x_scissor"]],
  [20,92],120,GROWTH_FAST,[140,200,100],[180,240,140]);
addC(92,"Dreadwing",[TYPE_WIND,TYPE_DARK],70,68,55,75,60,52,
  [[1,"bug_buzz"],[1,"dark_pulse"],[25,"hurricane"],[30,"shadow_claw"],
   [35,"u_turn"],[40,"brave_bird"]],
  null,45,GROWTH_MEDIUM,[100,140,60],[120,180,80]);

// Bug/Poison (unique dual type)
addC(93,"Toxifin",[TYPE_WIND,TYPE_DARK],48,55,42,50,40,38,
  [[1,"poison_sting"],[5,"pin_missile"],[10,"pursuit"],[15,"poison_jab"],
   [20,"bug_buzz"],[25,"toxic"]],
  [30,94],45,GROWTH_MEDIUM,[120,160,60],[140,180,80]);
addC(94,"Scorpox",[TYPE_WIND,TYPE_DARK],78,90,68,72,55,58,
  [[1,"poison_jab"],[1,"bug_buzz"],[30,"shadow_claw"],[35,"crunch"],
   [40,"megahorn"],[45,"toxic"]],
  null,45,GROWTH_MEDIUM,[100,140,40],[120,160,60]);

// Normal/Flying (common Minimon type)
addC(95,"Skylark",[TYPE_NORMAL,TYPE_WIND],40,35,30,55,38,32,
  [[1,"tackle"],[1,"growl"],[5,"gust"],[10,"quick_attack"],
   [15,"wing_attack"],[20,"air_slash"]],
  [22,96],120,GROWTH_FAST,[200,200,160],[240,240,200]);
addC(96,"Hawkreign",[TYPE_NORMAL,TYPE_WIND],75,72,60,95,68,58,
  [[1,"air_slash"],[1,"quick_attack"],[25,"brave_bird"],[30,"extreme_speed"],
   [35,"hurricane"],[40,"fly"]],
  null,45,GROWTH_MEDIUM,[180,180,140],[220,220,180]);

// Fire/Normal (missing fire variant)
addC(97,"Flamouse",[TYPE_FIRE,TYPE_NORMAL],38,42,30,55,38,32,
  [[1,"scratch"],[1,"growl"],[5,"ember"],[10,"quick_attack"],
   [15,"fire_spin"],[20,"flame_wheel"]],
  [24,98],90,GROWTH_FAST,[255,160,60],[255,200,100]);
addC(98,"Pyromice",[TYPE_FIRE,TYPE_DARK],72,82,52,88,65,48,
  [[1,"flamethrower"],[1,"crunch"],[28,"fire_blast"],[32,"dark_pulse"],
   [38,"blaze_fury"],[42,"inferno"]],
  null,45,GROWTH_MEDIUM,[240,120,40],[255,160,60]);

// Normal (blob/slime Minimon)
addC(99,"Slickslime",[TYPE_NORMAL],50,35,50,30,35,55,
  [[1,"tackle"],[5,"harden"],[10,"body_slam"],[15,"recover"],
   [20,"sludge_bomb"]],
  [25,100],120,GROWTH_FAST,[180,180,200],[220,220,240]);
addC(100,"Glolslime",[TYPE_NORMAL,TYPE_LIGHT],90,55,85,45,60,80,
  [[1,"body_slam"],[1,"recover"],[25,"dazzling_gleam"],[30,"moonlight"],
   [35,"hyper_beam"],[40,"flash"]],
  null,45,GROWTH_MEDIUM,[160,160,180],[200,200,220]);
