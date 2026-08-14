// Minimon - Moves Database (118 moves)
const PHYSICAL="physical",SPECIAL="special",STATUS="status";
const MOVES={};

function _m(id,nm,type,cat,power,acc,pp,pri,eff,effch){
  MOVES[id]={id,name:nm,type,category:cat,power,accuracy:acc,maxPP:pp,
  priority:pri||0,effect:eff||null,effectChance:effch||100};
}

// NORMAL
_m("tackle","Tackle",TYPE_NORMAL,PHYSICAL,40,100,35);
_m("scratch","Scratch",TYPE_NORMAL,PHYSICAL,40,100,35);
_m("quick_attack","Quick Attack",TYPE_NORMAL,PHYSICAL,40,100,30,1);
_m("bite","Bite",TYPE_DARK,PHYSICAL,60,100,25,"flinch",30);
_m("headbutt","Headbutt",TYPE_NORMAL,PHYSICAL,70,100,15,"flinch",30);
_m("body_slam","Body Slam",TYPE_NORMAL,PHYSICAL,85,100,15,"paralyze",30);
_m("hyper_beam","Hyper Beam",TYPE_NORMAL,SPECIAL,150,90,5);
_m("swift","Swift",TYPE_NORMAL,SPECIAL,60,0,20);
_m("wrap","Wrap",TYPE_NORMAL,PHYSICAL,15,90,20);
_m("pursuit","Pursuit",TYPE_DARK,PHYSICAL,40,100,20);
_m("crunch","Crunch",TYPE_DARK,PHYSICAL,80,100,15,"def_down",20);
_m("extreme_speed","Extreme Speed",TYPE_NORMAL,PHYSICAL,80,100,5,2);
_m("megahorn","Megahorn",TYPE_NORMAL,PHYSICAL,120,85,10);
_m("hammer_arm","Hammer Arm",TYPE_NORMAL,PHYSICAL,100,90,10,"spd_down",100);
_m("double_edge","Double Edge",TYPE_NORMAL,PHYSICAL,120,100,15,"recoil",100);
_m("horn_attack","Horn Attack",TYPE_NORMAL,PHYSICAL,65,100,25);
_m("slam","Slam",TYPE_NORMAL,PHYSICAL,80,75,20);
_m("fury_swipes","Fury Swipes",TYPE_NORMAL,PHYSICAL,18,80,15,"multi_hit",100);
_m("rage","Rage",TYPE_NORMAL,PHYSICAL,55,100,20);
_m("growl","Growl",TYPE_NORMAL,STATUS,0,100,40,"atk_down",100);
_m("leer","Leer",TYPE_NORMAL,STATUS,0,100,30,"def_down",100);
_m("tail_whip","Tail Whip",TYPE_NORMAL,STATUS,0,100,30,"def_down",100);
_m("harden","Harden",TYPE_NORMAL,STATUS,0,0,30,"def_up",100);
_m("agility","Agility",TYPE_NORMAL,STATUS,0,0,30,"spd_up",100);
_m("swords_dance","Swords Dance",TYPE_NORMAL,STATUS,0,0,20,"atk_up",100);
_m("iron_head","Iron Head",TYPE_NORMAL,PHYSICAL,80,100,15,"flinch",30);
_m("iron_tail","Iron Tail",TYPE_NORMAL,PHYSICAL,100,75,15,"def_down",30);
_m("metal_claw","Metal Claw",TYPE_NORMAL,PHYSICAL,50,95,35,"atk_up",10);
_m("pin_missile","Pin Missile",TYPE_NORMAL,PHYSICAL,25,95,20,"multi_hit",100);
_m("poison_sting","Poison Sting",TYPE_NORMAL,PHYSICAL,15,100,35,"poison",30);

// FIRE
_m("ember","Ember",TYPE_FIRE,SPECIAL,40,100,25,"burn",10);
_m("fire_spin","Fire Spin",TYPE_FIRE,SPECIAL,35,85,15);
_m("flame_wheel","Flame Wheel",TYPE_FIRE,PHYSICAL,60,100,25,"burn",10);
_m("flamethrower","Flamethrower",TYPE_FIRE,SPECIAL,90,100,15,"burn",10);
_m("fire_blast","Fire Blast",TYPE_FIRE,SPECIAL,110,85,5,"burn",30);
_m("fire_fang","Fire Fang",TYPE_FIRE,PHYSICAL,65,95,15,"burn",10);
_m("flame_fang","Flame Fang",TYPE_FIRE,PHYSICAL,65,95,15,"burn",10);
_m("blaze_fury","Blaze Fury",TYPE_FIRE,SPECIAL,80,100,10);
_m("inferno","Inferno",TYPE_FIRE,SPECIAL,130,80,5,"burn",100);

// WATER
_m("water_gun","Water Gun",TYPE_WATER,SPECIAL,40,100,25);
_m("bubble","Bubble",TYPE_WATER,SPECIAL,40,100,30,"spd_down",10);
_m("water_pulse","Water Pulse",TYPE_WATER,SPECIAL,60,100,20);
_m("bubble_beam","Bubble Beam",TYPE_WATER,SPECIAL,65,100,20,"spd_down",10);
_m("aqua_jet","Aqua Jet",TYPE_WATER,PHYSICAL,40,100,20,1);
_m("hydro_pump","Hydro Pump",TYPE_WATER,SPECIAL,110,80,5);
_m("tidal_wave","Tidal Wave",TYPE_WATER,SPECIAL,100,90,10);
_m("ice_fang","Ice Fang",TYPE_ICE,PHYSICAL,65,95,15,"freeze",10);

// GRASS
_m("vine_whip","Vine Whip",TYPE_GRASS,PHYSICAL,45,100,25);
_m("leech_seed","Leech Seed",TYPE_GRASS,STATUS,0,90,10,"leech",100);
_m("razor_leaf","Razor Leaf",TYPE_GRASS,PHYSICAL,55,95,25,"crit_boost",100);
_m("seed_bomb","Seed Bomb",TYPE_GRASS,PHYSICAL,80,100,15);
_m("giga_drain","Giga Drain",TYPE_GRASS,SPECIAL,75,100,10,"recover",100);
_m("solar_beam","Solar Beam",TYPE_GRASS,SPECIAL,120,100,10);
_m("wood_hammer","Wood Hammer",TYPE_GRASS,PHYSICAL,120,100,15,"recoil",100);
_m("leaf_blade","Leaf Blade",TYPE_GRASS,PHYSICAL,90,100,15,"crit_boost",100);
_m("forest_wrath","Forest Wrath",TYPE_GRASS,SPECIAL,110,85,5);

// ELECTRIC
_m("thundershock","Thundershock",TYPE_ELECTRIC,SPECIAL,40,100,30,"paralyze",10);
_m("spark","Spark",TYPE_ELECTRIC,PHYSICAL,65,100,20,"paralyze",30);
_m("thunder_wave","Thunder Wave",TYPE_ELECTRIC,STATUS,0,100,20,"paralyze",100);
_m("thunder_fang","Thunder Fang",TYPE_ELECTRIC,PHYSICAL,65,95,15,"paralyze",10);
_m("thunderbolt","Thunderbolt",TYPE_ELECTRIC,SPECIAL,90,100,15,"paralyze",10);
_m("thunder","Thunder",TYPE_ELECTRIC,SPECIAL,110,70,10,"paralyze",30);

// ICE
_m("ice_shard","Ice Shard",TYPE_ICE,PHYSICAL,40,100,30,1);
_m("icy_wind","Icy Wind",TYPE_ICE,SPECIAL,55,95,15,"spd_down",100);
_m("frost_bite","Frost Bite",TYPE_ICE,PHYSICAL,65,95,15,"freeze",10);
_m("ice_beam","Ice Beam",TYPE_ICE,SPECIAL,90,100,10,"freeze",10);
_m("blizzard","Blizzard",TYPE_ICE,SPECIAL,110,70,5,"freeze",20);
_m("aurora_beam","Aurora Beam",TYPE_ICE,SPECIAL,65,100,20,"atk_down",10);

// SPIRIT/DARK
_m("dark_pulse","Dark Pulse",TYPE_DARK,SPECIAL,80,100,15,"flinch",20);
_m("shadow_sneak","Shadow Sneak",TYPE_SPIRIT,PHYSICAL,40,100,30,1);
_m("shadow_claw","Shadow Claw",TYPE_SPIRIT,PHYSICAL,70,100,15,"crit_boost",100);
_m("shadow_ball","Shadow Ball",TYPE_SPIRIT,SPECIAL,80,100,15,"sdef_down",20);
_m("shadow_blast","Shadow Blast",TYPE_SPIRIT,SPECIAL,120,85,5);
_m("spite","Spite",TYPE_SPIRIT,STATUS,0,100,10);
_m("night_shade","Night Shade",TYPE_SPIRIT,SPECIAL,0,100,15);
_m("will_o_wisp","Will-O-Wisp",TYPE_SPIRIT,STATUS,0,85,15,"burn",100);
_m("spirit_break","Spirit Break",TYPE_SPIRIT,PHYSICAL,75,100,15,"satk_down",100);

// EARTH
_m("mud_slap","Mud Slap",TYPE_EARTH,SPECIAL,20,100,10,"atk_down",100);
_m("sand_attack","Sand Attack",TYPE_EARTH,STATUS,0,100,15,"atk_down",100);
_m("dig","Dig",TYPE_EARTH,PHYSICAL,80,100,10);
_m("rock_throw","Rock Throw",TYPE_EARTH,PHYSICAL,50,90,15);
_m("rock_slide","Rock Slide",TYPE_EARTH,PHYSICAL,75,90,10,"flinch",30);
_m("stone_edge","Stone Edge",TYPE_EARTH,PHYSICAL,100,80,5,"crit_boost",100);
_m("earthquake","Earthquake",TYPE_EARTH,PHYSICAL,100,100,10);
_m("fissure","Fissure",TYPE_EARTH,PHYSICAL,0,30,5);
_m("sandstorm","Sandstorm",TYPE_EARTH,STATUS,0,0,10);

// WIND
_m("gust","Gust",TYPE_WIND,SPECIAL,40,100,35);
_m("air_slash","Air Slash",TYPE_WIND,SPECIAL,75,95,15,"flinch",30);
_m("tailwind","Tailwind",TYPE_WIND,STATUS,0,0,15,"spd_up",100);
_m("hurricane","Hurricane",TYPE_WIND,SPECIAL,110,70,10);
_m("brave_bird","Brave Bird",TYPE_WIND,PHYSICAL,120,100,15,"recoil",100);
_m("confuse_ray","Confuse Ray",TYPE_WIND,STATUS,0,100,10,"confuse",100);

// LIGHT
_m("flash","Flash",TYPE_LIGHT,STATUS,0,100,20,"satk_down",100);
_m("dazzling_gleam","Dazzling Gleam",TYPE_LIGHT,SPECIAL,80,100,10);
_m("moonlight","Moonlight",TYPE_LIGHT,STATUS,0,0,5,"recover",100);
_m("bug_buzz","Bug Buzz",TYPE_WIND,SPECIAL,80,100,10);

// DRAGON
_m("dragon_rage","Dragon Rage",TYPE_DRAGON,SPECIAL,0,100,10);
_m("dragon_claw","Dragon Claw",TYPE_DRAGON,PHYSICAL,80,100,15);
_m("dragon_pulse","Dragon Pulse",TYPE_DRAGON,SPECIAL,85,100,10);
_m("dragon_dance","Dragon Dance",TYPE_DRAGON,STATUS,0,0,20,"atk_spd_up",100);
_m("outrage","Outrage",TYPE_DRAGON,PHYSICAL,120,100,10);

// STATUS
_m("nasty_plot","Nasty Plot",TYPE_DARK,STATUS,0,0,20,"satk_up",100);
_m("recover","Recover",TYPE_NORMAL,STATUS,0,0,10,"recover",100);
_m("sludge_bomb","Sludge Bomb",TYPE_DARK,SPECIAL,90,100,10,"poison",30);
_m("protect","Protect",TYPE_NORMAL,STATUS,0,0,10);
_m("rest","Rest",TYPE_SPIRIT,STATUS,0,0,5,"recover",100);
_m("sleep_powder","Sleep Powder",TYPE_GRASS,STATUS,0,75,15,"sleep",100);
_m("stun_spore","Stun Spore",TYPE_GRASS,STATUS,0,75,15,"paralyze",100);
_m("toxic","Toxic",TYPE_DARK,STATUS,0,85,10,"poison",100);

// BUG (now properly typed)
_m("x_scissor","X-Scissor",TYPE_WIND,PHYSICAL,80,100,15);
_m("u_turn","U-Turn",TYPE_WIND,PHYSICAL,70,100,20);
_m("leech_life","Leech Life",TYPE_WIND,PHYSICAL,80,100,10,"recover",100);

// FLYING (using Wind type)
_m("wing_attack","Wing Attack",TYPE_WIND,PHYSICAL,60,100,20);
_m("fly","Fly",TYPE_WIND,PHYSICAL,90,95,10);

// POISON (using Dark type)
_m("poison_jab","Poison Jab",TYPE_DARK,PHYSICAL,80,100,20,"poison",30);
_m("venoshock","Venoshock",TYPE_DARK,SPECIAL,65,100,10,"poison",50);

// MORE STATUS
_m("bulk_up","Bulk Up",TYPE_NORMAL,STATUS,0,0,20,"def_up",100);
_m("calm_mind","Calm Mind",TYPE_SPIRIT,STATUS,0,0,20,"satk_up",100);
_m("rock_polish","Rock Polish",TYPE_EARTH,STATUS,0,0,20,"spd_up",100);

// ===== LEGENDARY SIGNATURE MOVES =====
_m("celestial_nova","Celestial Nova",TYPE_LIGHT,SPECIAL,150,90,5,
  null,100);
_m("void_eruption","Void Eruption",TYPE_DARK,SPECIAL,140,95,5,
  null,100);
_m("cataclysm","Cataclysm",TYPE_FIRE,PHYSICAL,160,85,5,
  null,100);
_m("abyssal_geyser","Abyssal Geyser",TYPE_WATER,SPECIAL,145,90,5,
  null,100);
_m("origin_pulse","Origin Pulse",TYPE_NORMAL,SPECIAL,130,100,5,
  null,100);
