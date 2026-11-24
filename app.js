"use strict";
/* ================= utils ================= */
const $=id=>document.getElementById(id);
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money=n=>(n<0?"−$":"$")+Math.abs(n).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
const pnlStr=n=>(n>0?"+":n<0?"−":"")+"$"+Math.abs(n).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const dkey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const sameDay=(ts,d=new Date())=>dkey(new Date(ts))===dkey(d);
const timeStr=ts=>new Date(ts).toLocaleTimeString([], {hour:"numeric",minute:"2-digit"});
const whenStr=ts=>{const d=new Date(ts),n=new Date(),y=new Date();y.setDate(n.getDate()-1);if(sameDay(ts,n))return "Today · "+timeStr(ts);if(sameDay(ts,y))return "Yesterday · "+timeStr(ts);return d.toLocaleDateString([], {month:"short",day:"numeric"})+" · "+timeStr(ts)};
const ago=ts=>{if(!ts)return "never";const s=(Date.now()-ts)/1000;if(s<60)return "just now";if(s<3600)return Math.round(s/60)+" min ago";if(s<86400)return Math.round(s/3600)+" h ago";return Math.round(s/86400)+" d ago"};
const ACCTS={poly:"Polymarket",manual:"Manual",bob:"Bob"};
const GROUPS=["Morning","Afternoon","Evening","Hair care","Weekly","Anytime"];
const DOW=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],DOWL=["Sundays","Mondays","Tuesdays","Wednesdays","Thursdays","Fridays","Saturdays"];
/* the user's checklist; bump PACK when it changes so installed apps pick it up */
const PACK=10;
const ONE_OFFS=[["2026-11-24",{t:"Patch the holes in the room",time:"7:45 PM",g:"Evening",steps:["Gather spackle, putty knife, sandpaper and touch-up paint","Clean loose bits and dust out of each hole","Fill each hole slightly overfilled","Let it dry (check the spackle label)","Sand smooth and wipe the dust","Touch up with paint once fully dry"],note:"Bigger holes may need a second thin coat after the first one dries."}],
 ["2026-11-24",{t:"Finish the room development",time:"8:00 PM",g:"Evening",note:"Finish the remaining room setup and workspace improvements. If it's a big job, write down the last few pieces left so tomorrow knows exactly where to pick up."}]];
/* portions: RER = 70 × kg^0.75, daily = RER × activity factor. Fresh mix ≈ 1.3 kcal/g, ≈ 230 kcal/cup; one batch ≈ 2,650 kcal (no eggs). */
const FRESH_KCAL_G=1.3,FRESH_KCAL_CUP=230,BATCH_KCAL=2650,BATCH_G=2050;
const ACTIVITY=[["1.2","Very inactive / weight loss"],["1.4","Senior or calm"],["1.6","Normal adult"],["1.8","Very active"]];
/* ---- dogs (pack 8) ---- */
const DOGS_DEFAULT={list:[{id:"boy",name:"Boy",weight:"",sensitive:true},{id:"girl",name:"Girl",weight:"",sensitive:false}],log:{},freezer:0};
const HUSKY_RECIPE={who:"dog",cat:"Meal",fav:true,name:"Senior husky meal prep (turkey and rice)",time:"About 1 hour",serves:"One batch of toppers",
 ingredients:["3 lb 93% lean ground turkey","4 cups cooked white rice","2 cups green beans","1 cup carrots","4 fully cooked eggs (only after both dogs have had normal stool for 48 hours)","Plain water"],
 steps:["Turkey: cook thoroughly in a large pan with no oil and no seasoning, then drain the fat","Rice: cook white rice with water only","Vegetables: steam or boil carrots and green beans until soft, then chop the carrots fairly small","Eggs (only once stomachs are stable): hard-boil or scramble plain, no butter or oil, then chop","Combine turkey, rice, green beans, carrots (and eggs)","Add a little warm water until moist rather than dry","Let everything cool completely","Divide into small freezer bags or containers (per dog AM/PM, or one bag per day for both)","Flatten the bags so they freeze and thaw quickly","Label: DOG FOOD — WEEK OF [DATE]","Keep about 3 days in the fridge, freeze the rest","Every night, move tomorrow's bag from the freezer to the fridge"],
 notes:"No seasoning whatsoever: no onion, garlic, salt, butter, oil, broth or sauces. The garlic in your groceries is for your food only, never the dogs.\n\nThis is a topper, not a complete diet. Diamond Naturals kibble stays the nutritional foundation (about 75%), fresh food about 25% maximum. Serve cold, room temperature or slightly warm, never piping hot.\n\nLater: rotate weeks (turkey + rice, chicken + sweet potato, lean beef + rice, turkey + egg) and slowly add salmon, sardines in water, pumpkin, blueberries, sweet potato. One change at a time."};
const DOG_TASKS=[
 {t:"Dogs: daily check-in",time:"9:00 PM",g:"Evening",link:"dogs",note:"Log food eaten, water, stool, urine and energy for both dogs. The app uses it to set tomorrow's fresh-food ratio."},
 {t:"Dogs: move tomorrow's food bag to the fridge",time:"9:10 PM",g:"Evening",link:"freezer",note:"Ticking this takes one bag off the freezer count."},
 {t:"Dog food: cook and freeze a batch",time:"",g:"Weekly",dow:[1],link:"dogbatch",note:"Meal-prep day. Cook the turkey batch, cool, portion, flatten, label and freeze. Then add the bags to the freezer count in Food → For the dogs."}];
const DOG_FLAGS="Call your vet if he (or she): refuses all food for a full day, won't drink, vomits repeatedly, has persistent watery diarrhea, becomes weak, has orange, red or brown urine, or struggles to pee. That's a health problem, not a meal-prep problem.";
const STOOL=["","1 · Very hard","2 · Firm","3 · Normal","4 · Soft","5 · Watery"];
const WATER_DEFAULT={goal:4000,step:500,log:{},start:"7:00 AM",end:"9:00 PM",every:90,notify:false,lastNotify:0,lastNudge:0};
const WATER_TASK={t:"Drink 4 L of water",time:"",g:"Anytime",link:"water",note:"Log each glass with +500 ml. This ticks itself off when you reach your goal."};
/* ---- food (pack 6) ---- */
const FOOD_CATS={me:["Breakfast","Meal prep","Drinks","Lessons","Other"],dog:["Meal","Treat","Topper"]};
const MEAL_START="2026-11-23";
const ROLE_LABEL={breakfast:"Meal 1 · Breakfast",prepA:"Meal 2 · Meal Prep A",prepB:"Meal 3 · Meal Prep B",drink:"Shake / drink",lesson:"Friday cooking lesson"};
const MP=(week,role,name,ingredients,steps,notes="")=>({who:"me",week,role,name,cat:{breakfast:"Breakfast",prepA:"Meal prep",prepB:"Meal prep",drink:"Drinks",lesson:"Lessons"}[role],ingredients,steps,notes});
const MENU_THEMES=["Lemon Garlic","Latin / Citrus","Mediterranean","Asian-inspired"];
const MEAL_RECIPES=[
 MP(1,"breakfast","Salmon, eggs and avocado toast",["Salmon","Eggs","Avocado","Whole-grain or sourdough bread","Lemon","Fresh fruit"],["Pan-cook salmon","Cook 2–3 eggs","Toast bread","Mash avocado onto toast","Finish salmon with fresh lemon","Serve with fruit"]),
 MP(1,"prepA","Lemon garlic chicken rice bowls",["Chicken thighs","Jasmine rice","Broccoli","Onion","Fresh garlic","Lemons","Olive oil","Fresh parsley","Salt","Black pepper"],["Chop onion and garlic","Marinate chicken with lemon, garlic, olive oil, salt and pepper","Brown chicken in the pan","Finish cooking until fully cooked (165°F inside)","Cook jasmine rice","Roast or sauté broccoli","Portion chicken + rice + broccoli","Finish with parsley and fresh lemon"]),
 MP(1,"prepB","Creamy garlic chicken pasta",["Chicken thighs or breast","Pasta","Fresh garlic","Parmesan","Spinach","Milk or light cream","Butter","Olive oil","Lemon","Salt","Black pepper"],["Cook pasta","Brown sliced chicken","Remove chicken","Cook chopped garlic briefly in butter","Add milk/cream","Melt Parmesan into the sauce","Add spinach","Return chicken","Add pasta","Finish with lemon and black pepper"]),
 MP(1,"drink","Banana peanut butter bulk shake",["Whole milk","Greek yogurt","Banana","Natural peanut butter","Oats","Cinnamon (optional)"],["Add everything to a blender","Blend until smooth"],"No added sugar."),
 MP(1,"lesson","Pan-seared steak + garlic potatoes",["Steak (ribeye or strip, 1–1.5 inches thick)","Baby or Yukon potatoes","Fresh garlic","Butter","Olive oil or high-heat oil","Fresh herbs (rosemary or thyme)","Salt","Black pepper"],
  ["Learn: how to properly sear meat","Learn: how to control stainless-steel heat","Learn: how to rest steak","Learn: how to make crispy potatoes","Take the steak out 30 min early, pat dry, salt well","Halve potatoes, boil 8–10 min until just tender, drain and let steam dry","Heat the stainless pan on medium-high until a drop of water dances, then add oil","Sear steak 3–4 min per side without moving it, until a deep crust forms","Add butter, garlic and herbs, spoon the butter over the steak for 1 min","Rest the steak 5–10 min on a board (aim for 130–135°F for medium-rare)","Fry potatoes cut-side down in the same pan until crispy, add garlic at the end","Slice the steak against the grain"],"Most common mistakes: a pan that isn't hot enough, a wet steak, and moving it too early."),
 MP(2,"breakfast","Steak and egg breakfast bowl",["Steak","Eggs","Avocado","Potatoes","Tomato","Lime","Cilantro"],["Dice and roast potatoes","Sear steak and let it rest","Cook eggs","Chop tomato, cilantro and avocado","Slice steak","Assemble the bowl","Finish with lime"]),
 MP(2,"prepA","Cilantro-lime chicken bowls",["Chicken thighs","Jasmine rice","Black beans","Corn","Avocado","Tomato","Onion","Garlic","Cilantro","Limes","Olive oil"],["Marinate chicken with lime, garlic, cilantro and olive oil","Cook chicken","Cook rice","Warm beans and corn","Make fresh tomato-onion-cilantro mixture","Portion everything into bowls","Add avocado fresh when eating"]),
 MP(2,"prepB","Beef tomato pasta",["Lean ground beef","Pasta","Crushed tomatoes","Fresh tomato","Onion","Garlic","Basil","Parmesan","Olive oil"],["Brown beef","Remove excess grease if needed","Cook onion","Add garlic","Add crushed tomatoes","Simmer","Add fresh basil","Combine with cooked pasta","Finish with Parmesan"]),
 MP(2,"drink","Lime-cucumber water",["Water","Cucumber","Lime","Mint"],["Slice cucumber and lime","Add to a pitcher with mint and water","Chill"],"Make fresh every 1–2 days."),
 MP(2,"lesson","Homemade chicken tacos",["Chicken thighs","Small corn or flour tortillas","Tomatoes","White onion","Jalapeño (optional)","Cilantro","Limes","Garlic","Avocado","Olive oil","Salt","Cumin and chili powder (optional)"],
  ["Learn: building flavor with fresh ingredients","Learn: making pico de gallo","Learn: proper chicken slicing","Learn: balancing acid, fat and salt","Marinate chicken in lime, garlic, oil, salt (and spices) for 20+ min","Pico: dice tomato and onion small, chop cilantro, add lime juice and salt, taste and adjust","Cook chicken in a hot pan 5–6 min per side until 165°F inside","Rest 5 min, then slice thin against the grain","Warm tortillas in a dry pan","Build tacos: chicken, pico, avocado, a squeeze of lime","Taste: flat needs salt, heavy needs lime, sharp needs avocado"]),
 MP(3,"breakfast","Greek breakfast plate",["Eggs","Greek yogurt","Whole-grain toast","Avocado","Tomato","Cucumber","Berries","Olive oil"],["Cook eggs the way you like","Toast bread and top with avocado","Slice tomato and cucumber, drizzle with olive oil and a pinch of salt","Serve Greek yogurt topped with berries"]),
 MP(3,"prepA","Garlic herb salmon bowls",["Salmon","Basmati or jasmine rice","Cucumber","Tomato","Spinach","Garlic","Lemon","Parsley","Greek yogurt","Olive oil","Yogurt sauce: Greek yogurt, cucumber, lemon, garlic, parsley, a little salt"],["Cook rice","Cook salmon with garlic, olive oil and lemon","Chop cucumber and tomato","Mix the yogurt sauce","Portion rice + salmon + vegetables","Keep the yogurt sauce separate until serving"]),
 MP(3,"prepB","Beef and spinach garlic pasta",["Lean beef strips or steak","Pasta","Spinach","Garlic","Parmesan","Olive oil","Butter","Lemon","Black pepper"],["Cook pasta","Quickly sear beef","Remove beef","Cook garlic in olive oil/butter","Add spinach","Add pasta","Add Parmesan","Return beef","Finish with lemon"]),
 MP(3,"drink","Berry yogurt shake",["Whole milk","Greek yogurt","Strawberries or blueberries","Banana","Oats","Peanut butter (optional)"],["Add everything to a blender","Blend until smooth"],"No added sugar."),
 MP(3,"lesson","Mediterranean chicken plate",["Chicken thighs","Basmati rice","Greek yogurt","Cucumber","Tomato","Red onion","Lemons","Garlic","Olive oil","Dried oregano","Parsley","Salt","Black pepper"],
  ["Learn: making a fresh marinade","Learn: making yogurt sauce","Learn: proper rice preparation","Learn: building a complete plated meal","Marinade: lemon juice, olive oil, garlic, oregano, salt, pepper. Coat chicken 30+ min","Rinse rice until the water runs clear, then cook 1 part rice to 1.5 parts water, covered, 15 min, rest 10 min","Yogurt sauce: grated cucumber (squeezed dry), yogurt, lemon, garlic, salt","Cook chicken in a hot pan or oven until 165°F, rest 5 min","Make a quick salad: tomato, cucumber, red onion, olive oil, lemon","Plate: rice, sliced chicken, salad, a spoon of sauce, parsley on top"]),
 MP(4,"breakfast","Egg, salmon and rice bowl",["Eggs","Salmon","Jasmine rice","Avocado","Cucumber","Green onion","Lime"],["Cook or reheat rice","Cook salmon","Cook eggs","Slice cucumber, avocado and green onion","Assemble the bowl","Finish with lime"]),
 MP(4,"prepA","Fresh ginger garlic chicken rice",["Chicken thighs","Jasmine rice","Broccoli","Bell peppers","Fresh ginger","Fresh garlic","Green onion","Lime","Sesame oil (optional)","Low-sodium soy sauce (optional)"],["Finely chop ginger and garlic","Slice chicken","Brown chicken","Add ginger and garlic","Add vegetables","Add a small amount of soy sauce if using","Serve over rice","Finish with lime and green onion"]),
 MP(4,"prepB","Garlic shrimp pasta",["Shrimp","Pasta","Fresh garlic","Cherry tomatoes","Spinach","Olive oil","Butter","Lemon","Parsley","Parmesan (optional)"],["Cook pasta","Cook shrimp briefly and remove","Cook chopped garlic in olive oil/butter","Add tomatoes","Add spinach","Add pasta","Return shrimp","Finish with lemon and parsley"]),
 MP(4,"drink","Ginger-lemon iced green tea",["Green tea","Fresh ginger","Lemon","Water","Mint (optional)"],["Slice ginger and steep with the tea in hot water 3–4 min","Remove tea bags, add lemon (and mint)","Chill"],"No added sugar. Make about 3 days at a time."),
 MP(4,"lesson","Homemade beef stir-fry",["Flank steak or sirloin","Broccoli","Bell peppers","Onion","Fresh ginger","Fresh garlic","Low-sodium soy sauce","Cornstarch","Neutral oil","Rice","Green onion","Lime"],
  ["Learn: knife skills","Learn: cutting vegetables evenly","Learn: cooking beef quickly without making it chewy","Learn: managing high heat","Learn: building a simple sauce","Freeze beef 20 min, then slice thin against the grain","Cut all vegetables the same size so they cook evenly","Toss beef with 1 tsp cornstarch and 1 tbsp soy sauce","Sauce: 3 tbsp soy, 1 tsp cornstarch, 1/4 cup water, grated ginger and garlic, lime","Get the pan smoking hot, sear beef in batches 60–90 sec, remove","Stir-fry vegetables 3–4 min, keep them crisp","Add sauce and beef back, toss until glossy, 30 sec","Serve over rice with green onion"],"Cook in small batches. A crowded pan steams the beef and makes it chewy.")];
const MEAL_TARGETS=`<b>Month 1: lean bulk.</b> Starting weight about 148 lb. Gain lean bodyweight while staying visually lean.<br>
• Protein: 150–165 g minimum<br>• Meals: 3 meals + 1 shake or drink if needed<br>• Weight: +0.25–0.75 lb per week<br>• Morning weigh-in every day<br>• Water: 4 L a day (log it on the Today page), more around training and heat<br><br>
<b>Prioritize</b> whole-food proteins, fruit and vegetables, rice, potatoes, oats and pasta, healthy fats, real herbs, citrus and aromatics. Keep ultra-processed food and added sugar minimal. Food doesn't need to be bland.<br><br>
<b>Adjust</b> · Intake low: add the shake · Appetite low: half the shake between meals, half after training · 7-day average not rising: add about 200–250 calories a day · Gaining too fast and waist growing: ease off slightly.`;
const GROCERY={Protein:["Salmon","Chicken thighs","Lean beef","Steak","Shrimp","Eggs","Greek yogurt","Cottage cheese"],Carbohydrates:["Jasmine rice","Basmati rice","Pasta","Potatoes","Oats","Whole-grain or sourdough bread","Black beans"],Fruit:["Bananas","Strawberries","Blueberries","Apples","Avocados","Lemons","Limes"],Vegetables:["Broccoli","Spinach","Bell peppers","Tomatoes","Cherry tomatoes","Cucumbers","Onions","Green onions","Corn"],"Flavor":["Fresh garlic","Fresh ginger","Cilantro","Parsley","Basil","Mint","Olive oil","Butter","Parmesan"],"Calorie boosters":["Natural peanut butter","Whole milk","Avocado","Walnuts","Oats"]};
const MEAL_TASKS=[
 {t:"Morning weigh-in",time:"6:05 AM",g:"Morning",link:"weigh",note:"Weigh after the bathroom, before food or water. The app tracks your 7-day average."},
 {t:"Meal 3: Meal Prep B",time:"5:30 PM",g:"Evening",link:"prepB",note:"Meal 3 of 3."},
 {t:"Shake or drink (if intake is low)",time:"",g:"Anytime",optional:true,link:"drink",note:"Add the shake if your intake is low today. Low appetite: drink half between meals and half after training."},
 {t:"Meal prep: plan and shop",time:"",g:"Weekly",dow:[0],link:"grocery",steps:["Review the food you have left","Open the grocery list and choose quantities","Defrost proteins for Monday"]},
 {t:"Meal prep: cook for Mon–Wed",time:"",g:"Weekly",dow:[1],link:"menu",steps:["Cook Meal Prep A","Cook Meal Prep B","Cook rice, pasta or other carbs","Cook vegetables","Portion about 3–4 days into the fridge"]},
 {t:"Meal prep: second batch for Thu–Sun",time:"",g:"Weekly",dow:[4],link:"menu",steps:["Cook a small batch of Meal Prep A","Cook a small batch of Meal Prep B","Cook carbs and vegetables","Portion for Thursday to Sunday"],note:"Don't keep cooked meat in the fridge for the whole seven days."},
 {t:"Friday cooking lesson",time:"",g:"Weekly",dow:[5],link:"lesson",note:"Cook one completely new recipe instead of relying only on meal prep."}];
const STARTER_RECIPES=[
 {who:"dog",name:"Plain chicken and rice",cat:"Meal",time:"30 min",serves:"Several meals",
  ingredients:["1 lb boneless, skinless chicken breast","1 cup white rice","Water (no salt, no seasoning)"],
  steps:["Boil the chicken in plain water 15–20 min until fully cooked","Cook the rice in plain water","Shred the chicken and check there are no bones","Mix about 1 part chicken to 2 parts rice","Cool completely before serving"],
  notes:"A bland meal for an upset stomach or an occasional topper. It isn't a complete long-term diet, so ask your vet about portion size for your husky."},
 {who:"dog",name:"Frozen peanut butter banana bites",cat:"Treat",time:"10 min + freezing",serves:"About 20 bites",
  ingredients:["1 ripe banana","2 tbsp xylitol-free peanut butter","1/2 cup plain unsweetened yogurt"],
  steps:["Mash the banana","Mix in the peanut butter and yogurt","Spoon into an ice-cube tray or silicone mold","Freeze at least 3 hours"],
  notes:"Check the peanut butter label for xylitol (also called birch sugar). It's toxic to dogs. A few bites a day is plenty."},
 {who:"dog",name:"Pumpkin oat biscuits",cat:"Treat",time:"40 min",serves:"About 30 biscuits",
  ingredients:["1 cup pure pumpkin purée (not pie filling)","2 eggs","2 1/2 cups oat flour (blend rolled oats)","2 tbsp xylitol-free peanut butter (optional)"],
  steps:["Heat oven to 350°F and line a tray","Mix pumpkin, eggs and peanut butter","Stir in oat flour until a firm dough forms","Roll to about 1/4 inch and cut shapes","Bake 20–25 min until dry and firm, then cool completely"],
  notes:"Keep in an airtight container for a week, or freeze."}];
const DOG_SAFE=`<b>Never feed dogs:</b> grapes or raisins, onions, garlic, chives, chocolate, xylitol (birch sugar, found in some peanut butter and gum), macadamia nuts, cooked bones, alcohol, caffeine, or very salty or fatty leftovers.<br><br>Keep treats to about 10% of daily calories. For homemade meals long-term, use a recipe your vet has checked so it's nutritionally complete.`;
/* ---- training plan (pack 5) ---- */
const REST_NOTE="Rest between sets: heavy compound lifts 2–3 min · curls, laterals and isolation 60–90 sec · abs 30–60 sec. The weights are starting targets, not mandatory loads for unfamiliar exercises.";
const LIFT_PHASES=[["2026-11-23","2026-11-29","Week 1: find accurate working weights. Stop each set with 2–3 reps left."],["2026-11-30","2026-12-06","Week 2: add reps at the same weights. Stop with 1–2 reps left."],["2026-12-07","2026-12-13","Week 3: increase the weights you've earned. Stop with 1–2 reps left."],["2026-12-14","2026-12-20","Week 4: consolidate. Cut volume if you're fatigued. Stop with 2–3 reps left."]];
const WORKOUT_PACK=[
 [1,"Workout: chest + shoulders",true,["Floor/bench press — 30 lb, 4×8–12","Incline press — 30 lb, 3×8–12","Shoulder press — 15–30 lb, 3×8–12","Lateral raises — 5–10 lb, 3×15–20","Overhead triceps extension — 30 lb total, 2×10–15","Cardio: 15-minute incline walk"],
  ["TKO chest press — 100 lb, 4×8–12","TKO incline press — 70–90 lb, 3×8–12","TKO shoulder press — calibrate, 3×8–12","DB lateral raises — 5–10 lb, 3×15–20","Triceps extension — calibrate, 2×12–15","Cardio: 15-minute incline walk"],"High intensity."],
 [2,"Workout: back + biceps",true,["Single-arm row — 30 lb, 4×10–15","Dumbbell pullover — 30 lb total, 3×10–12","Rear delt fly — 5–10 lb each, 3×15–20","Single-arm curls — 15–30 lb, 3×8–12 (right arm first)","Hammer curls — 15–30 lb, 2×10–12","Cardio: 15–20-minute walk"],
  ["TKO lat pulldown — 80–100 lb, 4×8–12","TKO seated row — 80–100 lb, 4×8–12","Pull-ups — bodyweight, 2×6–12","Rear delt fly — 5–10 lb, 3×15–20","Single-arm curls — 15–30 lb, 3×8–12 (right arm first)","Cardio: 15–20-minute walk"],"High intensity. Biceps imbalance: start with your right arm and match its reps with the left. Add one extra right-arm curl set if the gap persists."],
 [3,"Workout: legs + calves",true,["Goblet squats — 30 lb total, 4×12–20","Romanian deadlifts — 30 lb each, 4×10–15","Split squats — 15–30 lb each, 3×10 per leg","Platform calf raises — bodyweight or 30 lb, 4×15–20"],
  ["Smith machine squat — calibrate, 4×8–12","TKO leg extension — 70–100 lb, 3×10–15","TKO leg curl — 60–80 lb, 3×10–15","DB lunges — 15–30 lb each, 2×10 per leg","Platform calf raises — bodyweight or weighted, 4×15–20"],"High intensity. Calf technique: lower your heels slowly below the platform, hold the stretch for one second, then rise fully."],
 [4,"Workout: stamina + recovery",false,["Warm-up walk — 5 min","Jog/walk intervals: 30 sec easy jog + 90 sec walk, 6–10 rounds","Cooldown walk — 5 min","Full-body mobility — 10 min","Steam room 8–12 min (optional, only if you feel well and are hydrated)"],null,"Recovery day. No mandatory lifting. Builds conditioning without getting in the way of muscle recovery."],
 [5,"Workout: chest + arms + shoulders",true,["Incline DB press — 30 lb each, 4×10–12","Floor press — 30 lb each, 3×10–12","Lateral raises — 5–10 lb each, 4×15–25","Single-arm curls — 15–30 lb, 3×10–12","Hammer curls — 15–30 lb, 2×10–12","Overhead triceps extension — 30 lb total, 3×10–15","Close-grip push-ups — bodyweight, 2×10–15","Cardio: 10-minute easy walk"],
  ["TKO incline press — 70–90 lb, 4×8–12","TKO chest press — 100 lb, 3×10–12","DB lateral raises — 5–10 lb, 4×15–25","Single-arm curls — 15–30 lb, 3×10–12","Hammer curls — 15–30 lb, 2×10–12","DB triceps extension — 30 lb total, 3×10–15","Cardio: 10-minute easy walk"],"High intensity. Your primary aesthetic growth day."],
 [6,"Workout: lower body + back",true,["Goblet squat — 30 lb, 3×15–20","Romanian deadlift — 30 lb each, 3×12","Single-arm row — 30 lb, 4×12–15","Dumbbell pullover — 30 lb, 3×12","Calf raises — bodyweight or weighted, 4×20","Cardio: 20-minute moderate walk"],
  ["TKO leg extension — 70–100 lb, 3×12–15","TKO leg curl — 60–80 lb, 3×12–15","TKO lat pulldown — 80–100 lb, 3×10–12","TKO seated row — 80–100 lb, 3×10–12","Platform calf raises — bodyweight or weighted, 4×20","Cardio: 20-minute moderate walk"],"Moderate intensity."],
 [0,"Recovery: walk, mobility + weekly review",false,["Progress pictures (before training, same lighting as previous weeks)","Walk — 30–45 min","Mobility — 10 min","Steam (optional)","Update the training scoreboard in Notes: weights, reps, pull-ups, bodyweight, right vs left biceps, jog time"],null,"No heavy lifting today."]];
const STARTER_STEPS=["Push-ups — 2×25 (split into smaller sets if needed)","Bodyweight squats — 2×25","Calf raises — 2×25","Dumbbell curls — 2×10","Dead bugs — 2×10 per side","Plank — 2×30–45 sec"];
const NIGHT_STEPS=["Calf raises — 2×25","Dead bugs — 2×10 per side","Plank — 2×45 sec","Easy walk — 10 min","Mobility — 5 min"];
const FIT_NOTE={title:"Training plan: Nov 23 – Dec 20",body:`Weekly schedule (repeat for 4 weeks)
• Mon: chest + shoulders (high)
• Tue: back + biceps (high)
• Wed: legs + calves (high)
• Thu: cardio + mobility (recovery)
• Fri: chest + arms + shoulders (high)
• Sat: lower body + back (moderate)
• Sun: recovery + weekly review
Dumbbells are the guaranteed workout. Grandpa-gym machines are an optional addition or replacement.

Daily morning routine (10–15 min, keep 3–4 reps in reserve, optional on recovery days)
Push-ups 2×25 · squats 2×25 · calf raises 2×25 · DB curls 2×10 · dead bugs 2×10/side · plank 2×30–45 sec

Monthly progression
• Week 1: establish accurate working weights (2–3 reps left)
• Week 2: increase reps (1–2 reps left)
• Week 3: increase earned weights (1–2 reps left)
• Week 4: consolidate, reduce volume if fatigued (2–3 reps left)
Example, chest press: wk1 100 lb 10/10/10/10 → wk2 100 lb 12/11/10/10 → wk3 100 lb 12/12/12/12 → wk4 105 lb 8–10 per set. If you hit a target early, progress early.

${REST_NOTE}

Optional night routine: max 2–3 nights a week, only when recovering well. More fatigue isn't necessarily more growth.

Scoreboard (update every Sunday)
• Dumbbell press: start 30 lb each →
• Dumbbell row: start 30 lb →
• Chest press: start 100 lb →
• Pull-ups: baseline →
• Leg extension: baseline →
• Bodyweight: →
• Right vs left biceps: →
• Conditioning (jog time, walking endurance): →
• Training completion (target 5 main sessions/week): →`};
function packWorkouts(){return WORKOUT_PACK.map(([d,t,main,steps,alt,note])=>({id:uid(),t,time:"11:00 AM",g:"Morning",dow:[d],steps,note:[note,main?REST_NOTE:"",STEAM_NOTE].filter(Boolean).join("\n\n"),...(main?{main:true,phases:LIFT_PHASES}:{}),...(alt?{altName:"Grandpa gym",mainName:"Dumbbells",alt}:{})}))}
/* ---- skin plan (pack 4) ---- */
const W1=["2026-11-23","2026-11-29"],W2=["2026-11-30","2026-12-06"],W3=["2026-12-07","2026-12-13"],W4=["2026-12-14","2026-12-20"],W24=["2026-11-30","2026-12-20"],W34=["2026-12-07","2026-12-20"];
const ph=(w,text)=>[w[0],w[1],text];
const sCC="Cool eye compress — 5 minutes",sCL="YTTP cleanser — gently cleanse 30 seconds",sHA="Hyaluronic Acid — 2–3 drops on slightly damp skin",sNI="Niacinamide — 2–3 drops",
 sCA="Caffeine Solution — small amount under each eye (skip if eyes are irritated)",sEY="CeraVe Eye Repair Cream",sMO="Natural Moisturizing Factors moisturizer",sGS="Gua sha — 2–3 minutes, gentle pressure with enough slip",
 sBB="Beard balm — small amount",sSPF="Sunscreen SPF 60 — face, ears and neck",sCO="Castor oil — small amount on beard hair if tolerated";
const AM_BASE=[sCC,sCL,sHA,sNI,sCA,sEY,sMO,sGS,sBB,sSPF];
const MIN_AM="Cleanser → moisturizer → sunscreen",MIN_PM="Cleanser → moisturizer";
const SKIN_RULE="Only step up a treatment if your skin is comfortable, without persistent redness, burning or peeling. If under-eyes itch or turn red, pause caffeine serum and eye cream, use a cool compress and a bland moisturizer.";
const SKIN_PACK=[
 [1,"AM","Skin AM: retinoid & texture",AM_BASE,"",[]],
 [1,"PM","Skin PM: retinoid night",["YTTP cleanser","Let face dry completely","Granactive Retinoid 2% — pea-sized, avoid eyes and lips",sEY,sMO,"Rosehip oil — optional, 1–2 drops if dry",sCO],"No glycolic, salicylic acid, clay mask or microneedling tonight.",[ph(W1,"Week 1: recovery night. Replace the retinoid with hyaluronic acid + niacinamide."),ph(W24,"Retinoid night (pea-sized amount).")]],
 [2,"AM","Skin AM: brightening",[sCC,sCL,sHA,sCA,sEY,"Vitamin C Suspension 23% — small amount, avoid eyes",sMO,"Gua sha — gently, only if comfortable",sBB,sSPF],"On vitamin C mornings, niacinamide stays separate to keep things simple and reduce irritation.",[ph(W1,"Week 1: replace vitamin C with niacinamide."),ph(W24,"Vitamin C morning.")]],
 [2,"PM","Skin PM: even complexion",["YTTP cleanser",sHA,sNI,"Azelaic Acid 10% — optional (see this week)",sEY,sMO,"Rosehip oil — 1–2 drops","Castor oil on beard hair","Gua sha — gentle, if skin is comfortable"],"",[ph(W1,"Week 1: skip azelaic acid."),ph(W24,"Azelaic acid is optional, only if Monday's retinoid caused no irritation.")]],
 [3,"AM","Skin AM: hydration & recovery",AM_BASE,"",[]],
 [3,"PM","Skin PM: recovery night",["YTTP cleanser",sHA,sNI,sEY,sMO,"Rosehip oil — 2–3 drops if needed","Castor oil on beard hair","Gua sha — gentle"],"A recovery window between stronger treatments while keeping skin hydrated.",[]],
 [4,"AM","Skin AM: azelaic day",AM_BASE,"",[]],
 [4,"PM","Skin PM: azelaic acid",["YTTP cleanser","Hyaluronic Acid — let it settle","Azelaic Acid 10% — thin layer, avoid eyes",sEY,sMO,"Rosehip oil — optional","Castor oil on beard hair"],"Targets uneven complexion, blemishes and post-acne marks. No retinoid, glycolic or salicylic acid tonight.",[]],
 [5,"AM","Skin AM: exfoliation day",AM_BASE,"",[]],
 [5,"PM","Skin PM: exfoliation",["YTTP cleanser","Pat skin completely dry","This week's acid — thin layer, avoid eyes, lips and irritated skin (see this week)","Let it settle 1–2 minutes",sHA,sEY,sMO,"Rosehip oil — optional","Castor oil on beard hair if comfortable"],"Never combine glycolic and salicylic in one session. Skip gua sha tonight. On recovery Fridays use niacinamide instead of the acid.",[ph(W1,"Week 1: recovery, no exfoliation. Use niacinamide instead."),ph(W2,"Week 2: Glycolic Acid 7%."),ph(W3,"Week 3: Salicylic Acid 2% if congested, otherwise recovery (niacinamide)."),ph(W4,"Week 4: Glycolic Acid 7%.")]],
 [6,"AM","Skin AM: maintenance",[sCC,sCL,sHA,sCA,sEY,"Vitamin C — or niacinamide if skipping (see this week)",sMO,"Gua sha — gentle",sBB,sSPF],"",[ph(W1,"Week 1: niacinamide instead of vitamin C."),ph(W2,"Week 2: vitamin C optional if Tuesday's went well, otherwise niacinamide."),ph(W34,"Vitamin C morning.")]],
 [6,"PM","Skin PM: clay & maintenance",["YTTP cleanser","Clay mask — mainly oily areas and T-zone (optional)","Leave on 5–8 minutes (follow product instructions)","Rinse thoroughly with lukewarm water",sHA,sEY,sMO,"Rosehip oil — optional","Castor oil on beard hair","Foot maintenance"],"Skip the clay if Friday's exfoliation left your skin dry, sensitive or tight.",[]],
 [0,"AM","Skin AM: photo review & reset",["Photo: front-facing","Photo: left profile","Photo: right profile","Photo: under-eye close-up","Photo: beard close-up","Photo: under-jaw and neckline","Cool eye compress — 5–10 minutes",sCL,sHA,sNI,sCA,sEY,sMO,sGS,sBB,sSPF,"Write down: consistency, any irritation, new pimples, eye symptoms"],"Take photos before shaving or applying products, with similar natural lighting, distance and angles each week.",[ph(W1,"Checkpoint Nov 29: consistency and skin recovery."),ph(W2,"Checkpoint Dec 6: treatment tolerance."),ph(W3,"Checkpoint Dec 13: complexion and beard comparison."),ph(W4,"Checkpoint Dec 20: monthly results and next cycle.")]],
 [0,"PM","Skin PM: recovery & grooming",["Cleanse face","Shave or shape facial hair if desired — shaving cream, with the grain","Rinse with cool water","Hyaluronic Acid — only if comfortable",sEY,sMO,"Rosehip oil — optional if skin isn't irritated"],"No strong actives, no gua sha over freshly shaved skin, no microneedling.",[]]];
const SKIN_DATES=[
 ["2026-11-23",{t:"Skin: baseline photos",g:"Morning",time:"7:55 AM",steps:["Front-facing","Left profile","Right profile","Under-eye close-up","Beard close-up","Under-jaw and neckline"],note:"Baseline for the month. Take them before products, in natural light, and use the same setup every Sunday."}],
 ["2026-12-20",{t:"Skin: monthly results review",g:"Evening",time:"8:00 PM",steps:["Compare Dec 20 photos with the Nov 23 baseline","Rate under-eyes, complexion, glow, beard, texture, definition","Note what to keep, change or drop for the next cycle"],note:"Week 4 checkpoint: monthly results and next cycle. Default decision: keep the routine unchanged unless there's a meaningful reason to adjust it."}]];
const SKIN_RESTOCK={t:"Skin restock (only what's running low)",g:"Anytime",optional:true,steps:["Sunscreen (essential)","Gentle cleanser (essential)","Moisturizer (essential)","Preservative-free artificial tears (if eyes are dry)","Reusable cooling eye mask (useful)","Hydrocolloid pimple patches (useful)","Benzoyl peroxide 2.5% (only if needed for acne)"],note:"No new serums or microneedling devices needed this month."};
const SKIN_NOTE={title:"Skin plan: Nov 23 – Dec 20",body:`Objectives (in priority order)
1. Under-eye bags and redness: cold compresses, recovery, gentle eye care
2. Clearer complexion: consistent cleansing, targeted treatments
3. Skin glow: vitamin C, hydration, sunscreen
4. Beard development: consistent conditioning, growth tracking
5. Skin texture: retinoid, controlled exfoliation
6. Facial definition: gentle gua sha, grooming
7. Consistency: complete morning and night routines

Treatment calendar
• Week 1 (Nov 23–29): basics only. Monday retinoid → recovery night, no vitamin C, Thursday azelaic, no Friday exfoliation
• Week 2 (Nov 30–Dec 6): retinoid starts, Tuesday vitamin C, Friday glycolic, Saturday vitamin C optional
• Week 3 (Dec 7–13): Friday salicylic only if congested, Saturday vitamin C
• Week 4 (Dec 14–20): Friday glycolic
• Clay mask Saturdays: always optional
${SKIN_RULE} Don't use a product just because you own it.

Products
• YTTP cleanser: daily AM/PM
• Hyaluronic Acid 2% + B5: daily AM/PM
• Niacinamide 10% + Zinc: daily AM, selected nights
• Caffeine Solution 5% + EGCG: AM, if eyes aren't irritated
• CeraVe Eye Repair Cream: AM/PM, if tolerated
• Natural Moisturizing Factors + HA: daily AM/PM
• La Roche-Posay SPF 60: every morning
• Vitamin C Suspension 23%: 1–2 mornings weekly, if tolerated
• Granactive Retinoid 2%: 1–2 nights weekly
• Azelaic Acid 10%: 1–2 nights weekly
• Glycolic Acid 7%: alternating exfoliation weeks
• Salicylic Acid 2%: alternative for acne and congestion
• Rosehip Seed Oil: recovery nights
• Clay mask: Saturday, if needed
• Castor oil: optional beard conditioning
• Beard balm: morning grooming
• Hair peptide serum: according to label
• CeraVe SA Cleanser / Clinique 3-Step: alternatives
• Hydrocolloid patches, Benzoyl peroxide 2.5%: as needed
• Gua sha: gentle, healthy skin only
• Red LED mask: pending spec check
• Microneedling: paused pending professional guidance

Eye protocol
• Cool compress: mornings, optionally at night
• Caffeine serum: mornings, if tolerated
• Eye cream: AM/PM, if tolerated
• Preservative-free artificial tears: when needed
• Hydrate through the day, sleep 7–9 hours, reduce smoke exposure
If under-eye skin itches or turns red, stop caffeine serum and eye cream for a while, use a cool compress and a bland moisturizer. If the whites of your eyes look genuinely yellow, get a prompt medical check.

Beard protocol
• Beard balm every morning if needed · castor oil optional at night · gentle brushing daily
• Peptide serum per label · beard photos and shaping on Sunday
• Microneedling paused pending dermatologist guidance
Balm and castor oil condition existing hair; neither is proven to create new growth.

Checkpoints
• Baseline: Nov 23 · Week 1: Nov 29 (consistency, recovery) · Week 2: Dec 6 (tolerance) · Week 3: Dec 13 (complexion, beard) · Week 4: Dec 20 (results, next cycle)

Emergency minimum
AM: ${MIN_AM}. PM: ${MIN_PM}. A minimum routine still counts. Don't try to make up missed treatments the next day.`};
function packSkin(){return SKIN_PACK.map(([d,ap,t,steps,note,phases])=>({id:uid(),t,time:ap==="AM"?"8:00 AM":"7:15 PM",g:ap==="AM"?"Morning":"Evening",dow:[d],steps,note:[note,SKIN_RULE].filter(Boolean).join("\n\n"),phases,min:ap==="AM"?MIN_AM:MIN_PM}))}
const phaseFor=(t,k)=>(t.phases||[]).find(p=>k>=p[0]&&k<=p[1]);
const BONNET="Wear bonnet at night",SERUM="Apply peptide serum if due (not before sauna/steam)";
const HAIR_PACK=[
 [1,"Hair: hydration and reset",["Wash with Innersense shampoo","Apply Double Cream Deep Quencher for 10–15 minutes","Gently detangle with fingers while conditioner is in","Rinse thoroughly","Apply a pea-sized amount of Weightless Air Dry Cream","Apply a small amount of Hydro Style Flexi Jelly","Scrunch curls upward","Air-dry without touching",SERUM,BONNET],"Do the full routine after your last sauna or steam session of the day."],
 [2,"Hair: maintenance",["Lightly mist hair with water if needed","Reshape curls with fingers","Apply a tiny amount of Air Dry Cream if dry",SERUM,BONNET],"No shampoo or regular conditioner today."],
 [3,"Hair: gentle refresh",["Rinse hair if sweaty","Use Curl Quenching Conditioning Wash only if scalp needs cleansing","Rinse thoroughly","Apply a small amount of Air Dry Cream if needed","Apply Flexi Jelly if curls need definition",SERUM,BONNET],""],
 [4,"Hair: recovery",["Light water mist if necessary","Reshape curls with fingers",SERUM,BONNET],"No unnecessary product layering."],
 [5,"Hair: regular wash",["Wash with Innersense shampoo","Apply Essential Moisture Conditioner for 3–5 minutes","Gently detangle","Rinse thoroughly","Apply Weightless Air Dry Cream","Apply Hydro Style Flexi Jelly","Scrunch and air-dry",SERUM,BONNET],"Do the full routine after your last sauna or steam session of the day."],
 [6,"Hair: appearance maintenance",["Lightly mist hair if needed","Reshape front curls","Apply a small amount of Flexi Jelly if needed",SERUM,BONNET],""],
 [0,"Hair: review and recovery",["Take front picture","Take left-side picture","Take right-side picture","Take overhead picture","Take crown/back picture","Score the week: curl definition, softness, frizz, breakage, crown coverage, scalp, shape","Refresh curls with water if needed","Apply Air Dry Cream only if dry",SERUM,"Clean bonnet",BONNET],"Take review pictures with completely dry hair and consistent lighting, before adding products.\n\nTargets: more consistent curls, less roughness, reduced frizz, minimal breakage, stable or improving crown coverage, no persistent scalp irritation or flaking, balanced grow-out, routine adherence 85–100%."]];
const STEAM_NOTE="Before sauna/steam: no castor oil, no peptide serum, no fresh styling products, no treatment masks.\nAfter: rinse away sweat as needed, shampoo only if scheduled or the scalp needs it, condition on wash days, apply styling products after the final session.\nTwo sessions in one day? Save the full hair routine for afterward. Don't shampoo twice.";
const HAIR_DATES=[
 ["2026-11-30",{t:"Hair: Bond Curl Rehab (only if hair feels brittle)",g:"Hair care",optional:true,steps:["Wet hair","Apply Bond Curl Rehab Salve before shampooing","Leave for 15–30 minutes (follow product instructions)","Rinse thoroughly","Shampoo with Innersense","Apply Essential Moisture Conditioner","Rinse","Apply Air Dry Cream","Apply Flexi Jelly","Air-dry and wear bonnet at bedtime"],note:"Week 2 special treatment. If your hair feels damaged, brittle or prone to breakage, do this instead of the regular Monday routine (then tick Monday's routine off too). Skip the deep conditioning mask today unless your hair genuinely needs more moisture."}],
 ["2026-12-14",{t:"Hair: Double Cream only if dry this week",g:"Hair care",optional:true,note:"Week 4 (Dec 14–20) focus: moisture and shape management. Use the Double Cream Deep Quencher only if your hair feels dry."}],
 ["2026-12-21",{t:"Hair: monthly progress review",g:"Hair care",steps:["Regular wash","Take the full photo set (front, left, right, overhead, crown/back) with dry hair","Compare with the Nov 23 photos","Write the monthly review in your Notes"],note:"Final review, Dec 21–22: regular wash and photographs for the monthly progress assessment."}]];
const HAIR_NOTE={title:"Hair plan: Nov 23 – Dec 22",body:`Monthly objectives
• Restore softness and natural curl definition
• Reduce frizz, dryness and breakage
• Preserve length on top
• Monitor crown density and scalp visibility
• Maintain a clean, controlled shape
• Build a sustainable routine around sauna and steam

Products
• Innersense Hydrating Cream Hairbath: shampoo, 2x weekly
• Curlsmith Essential Moisture Conditioner: 1–2x weekly
• Curlsmith Curl Quenching Conditioning Wash: gentle cleansing, as needed
• Curlsmith Weightless Air Dry Cream: leave-in, wash days and as needed
• Curlsmith Hydro Style Flexi Jelly: definition, wash days and as needed
• Curlsmith Double Cream Deep Quencher: 1x weekly if dry
• Curlsmith Bond Curl Rehab Salve: every 2–4 weeks if needed
• Hair-growth peptide serum: according to label
• Sky Organics castor oil: optional
• Aztec Indian Healing Clay: on standby
• Coffee: on standby
• Satin bonnet: every night
• Microfiber towel: wash days

Special treatment calendar
• Week 1 (Nov 23–29): Double Cream, hydration reset
• Week 2 (Nov 30–Dec 6): Bond Curl Rehab on Monday if needed, strength
• Week 3 (Dec 7–13): Double Cream, softness and definition
• Week 4 (Dec 14–20): Double Cream if dry, moisture and shape
• Final review (Dec 21–22): regular wash and photographs

Sauna and steam
${STEAM_NOTE}

Sunday tracking targets
Curl definition: more consistent · Softness: less roughness · Frizz: reduced · Breakage: minimal · Crown coverage: stable or improving · Scalp: no persistent irritation or flaking · Shape: balanced grow-out · Routine adherence: 85–100%`};
const DAILY_PACK=[
 ["6:00 AM","Wake up and review markets","Morning"],["6:15 AM","Starter workout","Morning"],["7:00 AM","Outdoor sunlight","Morning"],["7:15 AM","Water and morning nutrition","Morning"],
 ["7:30 AM","Operator responsibilities","Morning"],["8:00 AM","Face care and grooming","Morning"],["8:30 AM","Morning buffer","Morning"],["9:00 AM","Primary engineering project","Morning"],["11:00 AM","Workout or steam","Morning"],
 ["12:00 PM","Market review","Afternoon"],["12:30 PM","Main meal","Afternoon"],["1:00 PM","Review/replay trades","Afternoon"],["1:30 PM","Walk or cardio","Afternoon"],["2:00 PM","Engineering/3D printing","Afternoon"],
 ["3:30 PM","AI Academy","Afternoon"],["4:00 PM","Laundry/maintenance","Afternoon"],["4:20 PM","Secondary project","Afternoon"],
 ["5:00 PM","Flexible personal time (until 7)","Evening"],["7:00 PM","Shower and hygiene","Evening"],["7:30 PM","Optional light workout/recovery","Evening"],["8:30 PM","Final market review","Evening"],
 ["9:15 PM","Reset for tomorrow","Evening"],["10:00 PM","End scheduled activities","Evening"]];
const WEEKLY_PACK=[[1,"","Systems day and plants"],[2,"","Development/recovery"],[3,"","Main training/development"],[4,"","Main training/development"],[5,"","Pet park"],
 [6,"8:00 AM","Weekly finance update"],[6,"","Grandpa responsibilities as applicable"],[0,"","Deep clean and weekly review"]];
const OLD_DEFAULTS=["Wake up and drink water","Check BTC levels","Write in journal","Trading session","Workout","Log dreams and emotions"];
function packRoutine(){return[...DAILY_PACK.map(([time,t,g])=>({id:uid(),t,time,g})),...WEEKLY_PACK.map(([d,time,t])=>({id:uid(),t,time,g:"Weekly",dow:[d]}))]}
const dowOf=k=>new Date(k+"T12:00:00").getDay();
const repLabel=r=>!r.dow||!r.dow.length||r.dow.length===7?"":r.dow.length===1?DOWL[r.dow[0]]:r.dow.map(d=>DOW[d]).join(", ");

/* ================= state ================= */
const KEY="dailyhq.v1";
const BOOKS=[["dreams","Dreams","Write it before it fades"],["ideas","Business ideas","Capture the spark"],["notes","Notes","Anything worth keeping"],["emotions","Emotions","How you feel, honestly"],["gratitude","Gratitude","What went right"]];
const MOODS=["Low","Meh","Okay","Good","Great"];
function defaults(){return{v:1,created:Date.now(),
 settings:{wallet:"",btcOnly:true,bank:{poly:0,manual:0,bob:0},stake:{poly:10,manual:10,bob:10},label:{poly:"BTC Up/Down",manual:"BTC",bob:"BTC"},book5:"Gratitude"},
 trades:{poly:[],manual:[],bob:[]},sync:{last:0,err:""},
 routine:[],pack:0,
 days:{},journal:{dreams:[],ideas:[],notes:[],emotions:[],gratitude:[]},xp:0,best:0,food:{recipes:[],grocery:{}},weights:{},water:{...WATER_DEFAULT,log:{}},smoke:{sessions:[],urges:[],active:null},dogs:JSON.parse(JSON.stringify(DOGS_DEFAULT)),
 ui:{acct:"poly",tf:"5m",book:"dreams",card:0,shown:30}}}
let S;
try{S=JSON.parse(localStorage.getItem(KEY)||"null")}catch(e){S=null}
if(!S||S.v!==1)S=defaults();
(function fill(){const d=defaults(),pack0=S.pack||0;for(const k in d)if(S[k]===undefined)S[k]=d[k];for(const k in d.settings)if(S.settings[k]===undefined)S.settings[k]=d.settings[k];for(const k in d.ui)if(S.ui[k]===undefined)S.ui[k]=d.ui[k];for(const b of BOOKS)if(!S.journal[b[0]])S.journal[b[0]]=[];
 const rg=x=>{if(x.g==="Day")x.g="Afternoon";if(x.g==="Night")x.g="Evening";if(!GROUPS.includes(x.g))x.g="Anytime"};S.routine.forEach(rg);Object.values(S.days).forEach(d=>(d.extra||[]).forEach(rg));
 if(pack0<2){const custom=S.routine.filter(r=>!OLD_DEFAULTS.includes(r.t)),have=new Set(custom.map(r=>r.t.toLowerCase()+"|"+(r.dow||[]).join()));
  S.routine=[...packRoutine().filter(r=>!have.has(r.t.toLowerCase()+"|"+(r.dow||[]).join())),...custom]}
 if(pack0<3){const has=t=>S.routine.some(r=>r.t===t);
  S.routine=S.routine.filter(r=>r.t!=="Full hair-progress assessment");
  for(const [d,t,steps,note] of HAIR_PACK)if(!has(t))S.routine.push({id:uid(),t,time:"",g:"Hair care",dow:[d],steps,note});
  const ws=S.routine.find(r=>r.t==="Workout or steam");if(ws&&!ws.note)ws.note=STEAM_NOTE;
  for(const [k,x] of HAIR_DATES){const dd=S.days[k]||(S.days[k]={done:{},extra:[]});if(!dd.extra.some(e=>e.t===x.t))dd.extra.push({id:uid(),time:"",...x})}
  if(!S.journal.notes.some(e=>e.title===HAIR_NOTE.title))S.journal.notes.push({id:uid(),ts:Date.now(),...HAIR_NOTE});
  S.hairStart=S.hairStart||dkey()}
 if(pack0<4){const has=t=>S.routine.some(r=>r.t===t);
  S.routine=S.routine.filter(r=>!(r.t==="Face care and grooming"&&!r.steps));
  for(const r of packSkin())if(!has(r.t))S.routine.push(r);
  for(const [k,x] of SKIN_DATES){const dd=S.days[k]||(S.days[k]={done:{},extra:[]});if(!dd.extra.some(e=>e.t===x.t))dd.extra.push({id:uid(),...x})}
  const td=S.days[dkey()]||(S.days[dkey()]={done:{},extra:[]});if(!td.extra.some(e=>e.t===SKIN_RESTOCK.t))td.extra.push({id:uid(),time:"",...SKIN_RESTOCK});
  if(!S.journal.notes.some(e=>e.title===SKIN_NOTE.title))S.journal.notes.push({id:uid(),ts:Date.now(),...SKIN_NOTE});
  S.skinStart=S.skinStart||dkey()}
 if(pack0<5){const has=t=>S.routine.some(r=>r.t===t);
  const st=S.routine.find(r=>r.t==="Starter workout");if(st&&!st.steps)Object.assign(st,{steps:STARTER_STEPS,optionalDow:[4,0],note:"10–15 minutes. Keep it comfortable, with 3–4 reps left. Optional on recovery days (Thursday and Sunday)."});
  S.routine=S.routine.filter(r=>!(r.t==="Workout or steam"&&!r.steps));
  for(const r of packWorkouts())if(!has(r.t))S.routine.push(r);
  const nt=S.routine.find(r=>r.t==="Optional light workout/recovery");if(nt&&!nt.steps)Object.assign(nt,{t:"Optional night workout",steps:NIGHT_STEPS,optional:true,note:"Maximum 2–3 nights a week, and only when you're recovering well. Deliberately light."});
  if(!S.journal.notes.some(e=>e.title===FIT_NOTE.title))S.journal.notes.push({id:uid(),ts:Date.now(),...FIT_NOTE});
  S.fitStart=S.fitStart||dkey()}
 if(pack0<6){S.food=S.food||{recipes:[]};S.food.grocery=S.food.grocery||{};S.weights=S.weights||{};
  for(const r of [...MEAL_RECIPES,...STARTER_RECIPES])if(!S.food.recipes.some(x=>x.name===r.name))S.food.recipes.push({id:uid(),ts:Date.now(),fav:false,starter:true,...r});
  const has=t=>S.routine.some(r=>r.t===t);for(const m of MEAL_TASKS)if(!has(m.t))S.routine.push({id:uid(),...m});
  const b=S.routine.find(r=>r.t==="Water and morning nutrition");if(b&&!b.link)Object.assign(b,{link:"breakfast",note:"Meal 1: this week's breakfast. Water target 4 L today."});
  const m=S.routine.find(r=>r.t==="Main meal");if(m&&!m.link)Object.assign(m,{link:"prepA",note:"Meal 2: Meal Prep A."})}
 if(pack0<7){S.water={...WATER_DEFAULT,...(S.water||{}),log:(S.water&&S.water.log)||{}};if(!S.routine.some(r=>r.link==="water"))S.routine.push({id:uid(),...WATER_TASK});
  const b=S.routine.find(r=>r.t==="Water and morning nutrition");if(b&&b.note)b.note=b.note.replace("about 3 L","4 L")}
 if(pack0<8){if(!S.dogs||!S.dogs.list)S.dogs=JSON.parse(JSON.stringify(DOGS_DEFAULT));
  if(!S.food.recipes.some(r=>r.name===HUSKY_RECIPE.name))S.food.recipes.push({id:uid(),ts:Date.now(),...HUSKY_RECIPE});
  for(const t of DOG_TASKS)if(!S.routine.some(r=>r.link===t.link))S.routine.push({id:uid(),...t})}
 if(pack0<9&&S.dogs){S.dogs.kibbleKcal=S.dogs.kibbleKcal||350;const wt={boy:"45",girl:"55"};
  for(const d of S.dogs.list){if(!d.weight&&wt[d.id])d.weight=wt[d.id];d.factor=d.factor||1.4;d.wlog=d.wlog||{};if(!Object.keys(d.wlog).length&&parseFloat(d.weight))d.wlog[dkey()]=parseFloat(d.weight)}
  const g=S.dogs.list.find(d=>d.id==="girl");if(g&&!g.goal){g.goal="lose";g.target=Math.round(parseFloat(g.weight||55)*0.9*2)/2}
  if(!S.routine.some(r=>r.link==="dogweigh"))S.routine.push({id:uid(),t:"Weigh the dogs",time:"",g:"Weekly",dow:[0],link:"dogweigh",note:"Weekly weigh-in for the weight-loss plan. Enter the numbers under Names and weights; the app shows whether she's on pace (0.5–1 lb a week)."})}
 if(pack0<10){for(const [k,x] of ONE_OFFS){if(k<dkey())continue;const dd=S.days[k]||(S.days[k]={done:{},extra:[]});if(!dd.extra.some(e=>e.t===x.t))dd.extra.push({id:uid(),...x})}}
 S.pack=PACK})();
let saveT;function save(){clearTimeout(saveT);saveT=setTimeout(()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){toast("Couldn't save. Your phone storage may be full.")}if(typeof scheduleSoon==="function")scheduleSoon()},150)}
addEventListener("pagehide",()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}});
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}

/* ================= feedback ================= */
function toast(t,btn,fn){document.querySelectorAll(".toast").forEach(x=>x.remove());const d=document.createElement("div");d.className="toast"+(btn?" long":"");d.innerHTML=`<span>${esc(t)}</span>`;if(btn){const b=document.createElement("button");b.textContent=btn;b.onclick=()=>{d.remove();fn()};d.appendChild(b)}document.body.appendChild(d);setTimeout(()=>d.remove(),btn?4600:2700)}
function burst(el,colors=["#EFBC90","#86D3B0","#F6E3CC","#7AB8B8"]){if(RM||!el)return;const r=el.getBoundingClientRect();for(let i=0;i<18;i++){const p=document.createElement("i");p.className="burst";p.style.left=(r.left+r.width/2)+"px";p.style.top=(r.top+r.height/2)+"px";p.style.background=colors[i%colors.length];const a=Math.random()*Math.PI*2,d=50+Math.random()*90;p.style.setProperty("--bx",Math.cos(a)*d+"px");p.style.setProperty("--by",Math.sin(a)*d-30+"px");p.style.setProperty("--br",Math.random()*540+"deg");document.body.appendChild(p);setTimeout(()=>p.remove(),900)}}
function countUp(el,to,from){if(RM||from===to){el.textContent=money(to);return}const t0=performance.now();(function f(t){const k=Math.min(1,(t-t0)/900),e=1-Math.pow(1-k,3);el.textContent=money(from+(to-from)*e);if(k<1)requestAnimationFrame(f)})(t0)}
const level=()=>Math.floor(S.xp/1000)+1;
function addXP(n,el){const before=level();S.xp=Math.max(0,S.xp+n);if(n>0&&level()>before){setTimeout(()=>{toast("Level up! You're level "+level());burst(el||document.body)},300)}}

/* ================= clock + week ================= */
function tick(){const d=new Date(),h=d.getHours()%12||12,m=String(d.getMinutes()).padStart(2,"0");$("time").innerHTML=`${h}<i>:</i>${m}`;$("dt").textContent=d.toLocaleDateString([], {weekday:"long",month:"long",day:"numeric"});
 if(tick.day&&tick.day!==dkey()){renderAll()}tick.day=dkey()}
function dayData(k){return S.days[k]||(S.days[k]={done:{},extra:[]})}
function tasksFor(k){const d=S.days[k]||{done:{},extra:[]},wd=dowOf(k);const list=[...S.routine.filter(r=>!r.dow||!r.dow.length||r.dow.includes(wd)).map(r=>({...r,rep:true,optional:!!(r.optional||(r.optionalDow||[]).includes(wd))})),...(d.extra||[]).map(x=>({...x,rep:false}))];
 const later=d.later||{};list.sort((a,b)=>(later[a.id]?1:0)-(later[b.id]?1:0)||GROUPS.indexOf(a.g)-GROUPS.indexOf(b.g)||tmin(a.time)-tmin(b.time));return list}
function tmin(t){if(!t)return 9999;const m=/^(\d{1,2})(?::(\d{2}))?\s*([ap]m)?$/i.exec(t.trim());if(!m)return 9998;let h=+m[1];const mm=+(m[2]||0);if(m[3]){const pm=/p/i.test(m[3]);if(pm&&h<12)h+=12;if(!pm&&h==12)h=0}return h*60+mm}
function isComplete(k){const t=tasksFor(k).filter(x=>!x.optional);if(!t.length)return false;const d=S.days[k];return !!d&&t.every(x=>d.done[x.id])}
const useAlt=(k,t)=>!!(t.alt&&S.days[k]&&S.days[k].variant&&S.days[k].variant[t.id]);
const stepList=(k,t)=>useAlt(k,t)?t.alt:(t.steps||[]);
const stepKey=(k,t)=>useAlt(k,t)?t.id+":alt":t.id;
function stepsDone(k,t){const s=(S.days[k]&&S.days[k].steps&&S.days[k].steps[stepKey(k,t)])||{};return stepList(k,t).filter((_,i)=>s[i]).length}
function adherence(match,start){let due=0,done=0;const d=new Date();for(let i=0;i<7;i++){const k=dkey(d);if(start&&k<start)break;const dd=S.days[k];
  for(const t of tasksFor(k))if(match(t)&&!t.optional){due++;if(dd&&dd.done[t.id])done++}d.setDate(d.getDate()-1)}return{due,done,pct:due?Math.round(done/due*100):null}}
const isSkin=t=>/^Skin (AM|PM):/.test(t.t);
function openSteps(id){const k=dkey(),t=tasksFor(k).find(x=>x.id===id);if(!t)return;
 const draw=root=>{const dd=dayData(k),steps=stepList(k,t),sk=stepKey(k,t),s=(dd.steps||{})[sk]||{},n=stepsDone(k,t),total=steps.length,isDone=!!dd.done[id];
  const adh=t.g==="Hair care"?{...adherence(x=>x.g==="Hair care",S.hairStart),label:"Hair routine",target:" Target 85–100%."}:isSkin(t)?{...adherence(isSkin,S.skinStart),label:"Skin routines",target:""}:t.main?{...adherence(x=>!!x.main,S.fitStart),label:"Main workouts",target:" Target: 5 a week."}:null;
  const variant=t.alt?`<div class="seg vseg" style="margin-bottom:12px"><span class="hl"></span><button type="button" data-v="0" class="${useAlt(k,t)?"":"on"}">${esc(t.mainName||"Main")}</button><button type="button" data-v="1" class="${useAlt(k,t)?"on":""}">${esc(t.altName||"Alternative")}</button></div>`:"";
  const lr=t.link&&ROLE_LABEL[t.link]?recipeFor(t.link,k):null,phase=phaseFor(t,k)||(lr?[0,0,"Week "+mealWeek(k)+" · "+MENU_THEMES[mealWeek(k)-1]+": "+lr.name]:null),minDone=dd.minDone&&dd.minDone[id];
  root.innerHTML=`<div class="grab"></div><h2>${esc(t.t)}</h2><p class="desc">${esc([t.time,t.rep?repLabel(t)||"Every day":"Today only",t.optional?"Optional":""].filter(Boolean).join(" · "))}${total?` · ${n} of ${total} done`:""}</p>
  ${phase?`<div class="note phase"><b>This week</b>${esc(phase[2])}</div>`:""}
  ${minDone?`<div class="note phase"><b>Done</b>Minimum routine today (${esc(t.min)}). That counts.</div>`:""}
  ${t.note?`<details class="note" ${t.note.length<170?"open":""}><summary>Notes and rules</summary>${esc(t.note)}</details>`:""}
  ${variant}${total?`<div class="steps">${steps.map((x,i)=>`<button type="button" class="step ${s[i]?"on":""}" data-i="${i}"><span class="ck">${s[i]?"✓":""}</span><span>${esc(x)}</span></button>`).join("")}</div>`:""}
  ${adh&&adh.pct!==null?`<p class="desc" style="margin-top:14px">${adh.label}, last 7 days: ${adh.done} of ${adh.due} done (${adh.pct}%).${adh.target}</p>`:""}
  <div class="btns"><button class="action p" id="st-all">${isDone?"Mark not done":total?"Mark all done":"Mark done"}</button>${t.link?`<button class="action" id="st-link">${esc(linkLabel(t.link))} →</button>`:""}${t.recipe?`<button class="action" id="st-rec">Open recipe →</button>`:""}${t.min&&!isDone?`<button class="action" id="st-min">Did the minimum</button>`:""}<button class="action" id="st-edit">Edit task</button></div>
  ${t.min&&!isDone?`<p class="desc" style="margin-top:10px">Low-energy day? Minimum: ${esc(t.min)}. It still counts.</p>`:""}`;
  const lb=root.querySelector("#st-link");if(lb)lb.onclick=()=>followLink(t.link,id);
  const rb=root.querySelector("#st-rec");if(rb)rb.onclick=()=>{closeSheet();openRecipe(t.recipe)};
  const mb=root.querySelector("#st-min");if(mb)mb.onclick=e=>{const dd2=dayData(k);(dd2.minDone=dd2.minDone||{})[id]=true;toggleTask(id,e.currentTarget);draw(root)};
  const vs=root.querySelector(".vseg");if(vs){const place=()=>{const b=vs.querySelector("button.on"),hl=vs.querySelector(".hl");if(b){hl.style.left=b.offsetLeft+"px";hl.style.width=b.offsetWidth+"px"}};requestAnimationFrame(place);
   vs.querySelectorAll("button").forEach(b=>b.onclick=()=>{const dd2=dayData(k);dd2.variant=dd2.variant||{};if(b.dataset.v==="1")dd2.variant[id]=true;else delete dd2.variant[id];save();renderToday();draw(root)})}
  root.querySelectorAll(".step").forEach(b=>b.onclick=()=>{const dd2=dayData(k);dd2.steps=dd2.steps||{};const m=dd2.steps[sk]=dd2.steps[sk]||{};const i=+b.dataset.i;m[i]=!m[i];if(!m[i])delete m[i];
   const all=stepsDone(k,t)===total;if(all&&!dd2.done[id])toggleTask(id,b);else if(!all&&dd2.done[id])toggleTask(id,b);else{save();renderToday()}draw(root)});
  root.querySelector("#st-all").onclick=e=>{const dd2=dayData(k);dd2.steps=dd2.steps||{};if(dd2.done[id]){dd2.steps[sk]={};if(dd2.minDone)delete dd2.minDone[id];toggleTask(id,e.currentTarget)}else{dd2.steps[sk]=Object.fromEntries(steps.map((_,i)=>[i,true]));toggleTask(id,e.currentTarget)}draw(root)};
  root.querySelector("#st-edit").onclick=()=>editTask(id)};
 $("sheet").innerHTML="";$("sheetwrap").hidden=false;draw($("sheet"))}
function streak(){let n=0;const d=new Date();if(!isComplete(dkey(d)))d.setDate(d.getDate()-1);while(S.days[dkey(d)]&&S.days[dkey(d)].complete){n++;d.setDate(d.getDate()-1)}return n}
function renderWeek(){const w=$("week"),d0=new Date();w.innerHTML="";for(let i=0;i<7;i++){const x=new Date(d0);x.setDate(d0.getDate()+i);const k=dkey(x),dd=S.days[k];const b=document.createElement("button");b.setAttribute("aria-pressed",i==0);
  const dot=i==0?(isComplete(k)?'<i class="full"></i>':""):(dd&&dd.extra&&dd.extra.length?"<i></i>":"");
  b.innerHTML=`<span>${x.toLocaleDateString([], {weekday:"short"})}</span><strong>${x.getDate()}</strong>${dot}`;b.onclick=e=>{e.stopPropagation();openDay(k,x,b)};w.appendChild(b)}}
function openDay(k,x,b){$("week").querySelectorAll("button").forEach(z=>z.setAttribute("aria-pressed",z===b));document.querySelector(".dayCard")?.remove();const today=k===dkey();
 const c=document.createElement("div");c.className="dayCard";const sr=$("strip").getBoundingClientRect(),br=b.getBoundingClientRect();c.style.left=Math.max(8,Math.min(br.left-sr.left,sr.width-410))+"px";
 const draw=()=>{const list=tasksFor(k),dd=S.days[k]||{done:{}};
  c.innerHTML=`<div class="eyebrow">${today?"Today":"Planned"}</div><h3>${esc(x.toLocaleDateString([], {weekday:"long",month:"long",day:"numeric"}))}</h3>
  <ul>${list.map(t=>`<li class="${today&&dd.done[t.id]?"done":""}"><span>${esc(t.time||t.g)}</span>${esc(t.t)}${t.rep?"":`<button class="link x" data-del="${t.id}" aria-label="Remove">✕</button>`}</li>`).join("")||'<li>No tasks yet</li>'}</ul>
  <form class="add" style="margin-top:10px"><input placeholder="Add a task for this day" aria-label="Task for this day" autocomplete="off"><button class="action p">Add</button></form>`;
  c.querySelector("form").onsubmit=e=>{e.preventDefault();const v=c.querySelector("input").value.trim();if(!v)return;dayData(k).extra.push({id:uid(),t:v,time:"",g:"Anytime"});save();draw();renderWeek();renderToday();toast("Added to "+x.toLocaleDateString([], {weekday:"long"}))};
  c.querySelectorAll("[data-del]").forEach(z=>z.onclick=e=>{e.stopPropagation();const dd2=dayData(k);dd2.extra=dd2.extra.filter(q=>q.id!==z.dataset.del);save();draw();renderToday()})};
 draw();$("strip").appendChild(c);c.addEventListener("click",e=>e.stopPropagation())}
document.addEventListener("click",e=>{if(!e.target.closest(".dayCard")&&!e.target.closest(".week")){document.querySelector(".dayCard")?.remove();$("week").querySelectorAll("button").forEach((z,i)=>z.setAttribute("aria-pressed",i==0))}});

/* ================= trades: stats ================= */
function tradesOf(a,tf){return S.trades[a].filter(t=>!t.hidden&&(tf==="All"||!tf||t.tf===tf))}
function stats(a,tf){const all=tradesOf(a,tf),res=all.filter(t=>t.res!=="open");const w=res.filter(t=>t.res==="win").length,l=res.length-w;
 const pnl=res.reduce((s,t)=>s+(+t.pnl||0),0),today=res.filter(t=>sameDay(t.ts)).reduce((s,t)=>s+(+t.pnl||0),0);
 const sorted=[...res].sort((x,y)=>y.ts-x.ts);let st="–";if(sorted.length){let n=0;const r0=sorted[0].res;for(const t of sorted){if(t.res===r0)n++;else break}st=(r0==="win"?"W":"L")+n}
 const open=all.filter(t=>t.res==="open");
 const allRes=tradesOf(a,"All").filter(t=>t.res!=="open");const bal=(+S.settings.bank[a]||0)+allRes.reduce((s,t)=>s+(+t.pnl||0),0);
 return{all,res,w,l,pnl,today,st,open,openCost:open.reduce((s,t)=>s+(+t.cost||0),0),bal,wr:res.length?Math.round(w/res.length*100):null,sorted}}

/* ================= Polymarket sync ================= */
const API="https://data-api.polymarket.com/v2";
function tfOf(slug,title){let m=/updown-(\d+)(m|h)\b/.exec(slug||"");if(m)return m[2]==="h"?m[1]+"h":m[1]+"m";
 m=/(\d{1,2})(?::(\d{2}))?\s*([AP]M)\s*-\s*(\d{1,2})(?::(\d{2}))?\s*([AP]M)/i.exec(title||"");
 if(m){const a=tmin(`${m[1]}:${m[2]||"00"} ${m[3]}`),b=tmin(`${m[4]}:${m[5]||"00"} ${m[6]}`);let d=b-a;if(d<0)d+=1440;return d===60?"1h":d+"m"}
 if(/\d{1,2}\s*[AP]M/i.test(title||""))return "1h";return "Other"}
const isBTC=p=>/^btc-updown-/i.test(p.slug||"")||/^bitcoin up or down/i.test(p.title||"");
async function fetchPositions(wallet,status){let out=[],cursor=null,pages=0;do{const u=new URL(API+"/positions");u.searchParams.set("user",wallet);u.searchParams.set("limit","500");if(status)u.searchParams.set("status",status);if(cursor)u.searchParams.set("cursor",cursor);
  const r=await fetch(u,{cache:"no-store"});if(!r.ok)throw new Error("Polymarket answered "+r.status);const j=await r.json();out.push(...(j.data||[]));cursor=j.pagination&&j.pagination.has_more?j.pagination.next_cursor:null;pages++}while(cursor&&pages<12);return out}
let syncing=false;
async function sync(manual){const w=S.settings.wallet.trim();if(!w){if(manual)openSettings("wallet");return}if(syncing)return;syncing=true;$("syncbtn").classList.add("spin");renderSyncLine("Syncing…");
 try{const [a,b]=await Promise.all([fetchPositions(w),fetchPositions(w,"CLOSED")]);const seen=new Set();let added=0,updated=0;
  for(const p of [...a,...b]){if(S.settings.btcOnly&&!isBTC(p))continue;const id="pm:"+p.condition_id+":"+p.outcome_index;if(seen.has(id))continue;seen.add(id);
   const st=(p.status||"").toUpperCase(),pnl=+(p.total_pnl??p.realized_pnl??0);
   const t={id,src:"sync",ts:((p.first_entry_at||p.last_event_at||Date.now()/1000)*1000),title:p.title||p.slug,slug:p.slug,tf:tfOf(p.slug,p.title),side:p.outcome||"",
    cost:+(p.total_cost_usdc||p.entry_cost_usdc||(p.avg_price*p.total_size)||0),price:+(p.avg_price||0),pnl:Math.round(pnl*100)/100,res:st==="OPEN"?"open":(pnl>0?"win":"loss"),status:st};
   const ex=S.trades.poly.find(x=>x.id===id);
   if(!ex){S.trades.poly.push(t);added++}else if(!ex.edited){const ch=ex.res!==t.res||ex.pnl!==t.pnl;Object.assign(ex,t,{note:ex.note,hidden:ex.hidden});if(ch)updated++}}
  if(S.settings.btcOnly)S.trades.poly=S.trades.poly.filter(t=>t.src!=="sync"||t.edited||isBTC(t));
  S.sync={last:Date.now(),err:""};save();renderTrades();renderCards();
  if(manual||added)toast(added?`Synced · ${added} new trade${added>1?"s":""}`:updated?`Synced · ${updated} updated`:"Synced · no new trades")}
 catch(e){S.sync.err=navigator.onLine===false?"You're offline":"Couldn't reach Polymarket";save();if(manual)toast(S.sync.err+". Try again in a minute.")}
 finally{syncing=false;$("syncbtn").classList.remove("spin");renderSyncLine()}}
function renderSyncLine(msg){const el=$("syncline");if(!el)return;const w=S.settings.wallet;$("syncdot").hidden=!!w;
 if(S.ui.acct!=="poly"){el.innerHTML=`<span class="pdot off"></span>Logged by hand`;return}
 if(!w){el.innerHTML=`<span class="pdot off"></span><button class="link" id="connect" style="color:#F1C39D">Connect your wallet to sync</button>`;$("connect").onclick=()=>openSettings("wallet");return}
 el.innerHTML=`<span class="pdot ${S.sync.err?"err":""}"></span>${esc(msg||(S.sync.err?S.sync.err:"Synced "+ago(S.sync.last)))}<button class="link" id="syncnow">Sync now</button>`;$("syncnow").onclick=()=>sync(true)}

/* ================= trades: render ================= */
let shownBal=null;
function renderTrades(){const a=S.ui.acct,tf=S.ui.tf,st=stats(a,tf);
 document.querySelectorAll("#acct button").forEach(b=>b.classList.toggle("on",b.dataset.a===a));document.querySelectorAll("#tf button").forEach(b=>b.classList.toggle("on",b.dataset.t===tf));segAll();
 const balEl=$("bal");if(shownBal===null||S.view!=="trades")balEl.textContent=money(st.bal);else countUp(balEl,st.bal,shownBal);shownBal=st.bal;
 const tp=$("todaypnl");tp.textContent=(st.today>=0?"▲ ":"▼ ")+pnlStr(st.today)+" today";tp.className="chip "+(st.today>0?"up":st.today<0?"dn":"");
 const ap=$("allpnl");ap.textContent=pnlStr(st.pnl)+(tf==="All"?" all time":" on "+tf);ap.className="chip "+(st.pnl>0?"up":st.pnl<0?"dn":"");
 $("openchip").hidden=!st.open.length;$("openchip").textContent=st.open.length+" open · $"+st.openCost.toFixed(2)+" in play";
 $("wr").textContent=st.wr===null?"–":st.wr+"%";$("wr").className=st.wr===null?"":st.wr>=50?"up":"dn";$("rec").textContent=st.w+"–"+st.l;$("tstreak").textContent=st.st;$("tstreak").className=/^W/.test(st.st)?"up":/^L/.test(st.st)?"dn":"";$("tcount").textContent=st.all.length;
 $("quicklabel").textContent="Quick log · $"+(+S.settings.stake[a]||0)+" "+(a==="poly"?(tf==="All"?"5m":tf):"");
 drawSpark(st);
 const list=[...st.all].sort((x,y)=>y.ts-x.ts),n=S.ui.shown;
 $("log").innerHTML=list.length?list.slice(0,n).map(t=>`<button class="tr" data-id="${t.id}"><span class="res ${t.res==="win"?"w":t.res==="loss"?"l":"o"}">${t.res==="win"?"WON":t.res==="loss"?"LOST":"OPEN"}</span><span class="ti"><div>${esc(t.title||S.settings.label[a])}${t.side?" · "+esc(t.side):""}</div><small>${esc(t.tf)} · ${whenStr(t.ts)}${t.cost?" · $"+(+t.cost).toFixed(2)+" in":""}${t.src==="sync"?" · synced":""}${t.edited?" · edited":""}</small></span><span class="amt ${t.pnl>0?"up":t.pnl<0?"dn":""}">${t.res==="open"?"open":pnlStr(+t.pnl||0)}</span><span class="pen" aria-hidden="true">✎</span></button>`).join("")+(list.length>n?`<button class="action more" id="moretr">Show more</button>`:"")
  :`<div class="empty"><b>${a==="poly"&&!S.settings.wallet?"Connect your wallet or log your first trade":"No trades here yet"}</b>${a==="poly"?"Synced trades show up here automatically. You can also tap + Won or + Lost.":"Tap + Won or + Lost after each trade. Tap any trade to fix it."}</div>`;
 $("log").querySelectorAll(".tr").forEach(b=>b.onclick=()=>editTrade(a,b.dataset.id));
 $("moretr")&&($("moretr").onclick=()=>{S.ui.shown+=30;renderTrades()});renderSyncLine()}
function drawSpark(st){const sv=$("spark"),pts=[...st.res].sort((x,y)=>x.ts-y.ts).slice(-80);let acc=0;const ys=[0,...pts.map(t=>acc+=(+t.pnl||0))];
 if(ys.length<3){sv.innerHTML=`<text x="300" y="66" text-anchor="middle" fill="#A9BBB9" font-size="14" font-family="Work Sans,sans-serif">Your P&amp;L line appears after a few trades</text><line x1="0" x2="600" y1="96" y2="96" stroke="rgba(226,241,238,.18)" stroke-dasharray="4 6"/>`;return}
 const mn=Math.min(...ys),mx=Math.max(...ys),span=mx-mn||1,X=i=>i/(ys.length-1)*600,Y=v=>108-(v-mn)/span*96;
 const line=ys.map((v,i)=>(i?"L":"M")+X(i).toFixed(1)+" "+Y(v).toFixed(1)).join(" "),up=ys[ys.length-1]>=0,col=up?"#EFBC90":"#EE8E86";
 sv.innerHTML=`<defs><linearGradient id="gf" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".32"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient></defs>
 ${mn<0&&mx>0?`<line x1="0" x2="600" y1="${Y(0)}" y2="${Y(0)}" stroke="rgba(226,241,238,.2)" stroke-dasharray="4 6"/>`:""}
 <path d="${line} L600 120 L0 120Z" fill="url(#gf)"/><path class="line" d="${line}" fill="none" stroke="${col}" stroke-width="2.5" vector-effect="non-scaling-stroke"/><circle cx="600" cy="${Y(ys[ys.length-1])}" r="4.5" fill="${col}"/>`}
function quickLog(win,el){const a=S.ui.acct,stake=+S.settings.stake[a]||0,tf=a==="poly"?(S.ui.tf==="All"?"5m":S.ui.tf):(S.ui.tf==="All"?"5m":S.ui.tf);
 const t={id:uid(),src:"manual",ts:Date.now(),title:S.settings.label[a],tf,side:"",cost:stake,pnl:win?stake:-stake,res:win?"win":"loss",note:""};S.trades[a].push(t);addXP(5,el);save();renderTrades();renderCards();
 if(win)burst(el,["#86D3B0","#EFBC90","#F6E3CC"]);toast((win?"Win":"Loss")+" logged · "+pnlStr(t.pnl),"Edit",()=>editTrade(a,t.id))}

/* ================= sheet ================= */
function closeSheet(){$("sheetwrap").hidden=true;$("sheet").innerHTML="";delete $("sheet").dataset.kind}
$("sheetwrap").addEventListener("click",e=>{if(e.target===$("sheetwrap"))closeSheet()});
addEventListener("keydown",e=>{if(e.key==="Escape"){closeSheet();orbit(false)}});
function openSheet(html,bind){delete $("sheet").dataset.kind;$("sheet").innerHTML=`<div class="grab"></div>`+html;$("sheetwrap").hidden=false;bind($("sheet"));const f=$("sheet").querySelector("input:not([type=checkbox]),textarea");if(f&&matchMedia("(hover:hover)").matches)f.focus()}
function opts(name,list,val,cls=""){return `<div class="opts ${cls}" data-name="${name}">${list.map(([v,l])=>`<button type="button" data-v="${esc(v)}" class="${v===val?"on":""}">${esc(l)}</button>`).join("")}</div>`}
function bindOpts(root,onChange){root.querySelectorAll(".opts").forEach(g=>g.querySelectorAll("button").forEach(b=>b.onclick=()=>{g.querySelectorAll("button").forEach(x=>x.classList.toggle("on",x===b));onChange&&onChange(g.dataset.name,b.dataset.v)}))}
const optVal=(root,name)=>root.querySelector(`.opts[data-name="${name}"] .on`)?.dataset.v;
const toLocalInput=ts=>{const d=new Date(ts);d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,16)};

function editTrade(a,id){const isNew=!id;const t=isNew?{id:uid(),src:"manual",ts:Date.now(),title:S.settings.label[a],tf:S.ui.tf==="All"?"5m":S.ui.tf,side:"",cost:+S.settings.stake[a]||0,pnl:+S.settings.stake[a]||0,res:"win",note:""}:S.trades[a].find(x=>x.id===id);if(!t)return;
 openSheet(`<h2>${isNew?"Add a trade":"Edit trade"}</h2><p class="desc">${ACCTS[a]}${t.src==="sync"?" · synced from Polymarket. Your changes stay even after the next sync.":""}</p>
 <div class="field"><label>Result</label>${opts("res",[["win","Won"],["loss","Lost"],["open","Still open"]],t.res,"wl")}</div>
 <div class="pair"><div class="field"><label for="f-cost">Amount in ($)</label><input id="f-cost" type="number" inputmode="decimal" step="0.01" value="${+t.cost||0}"></div>
 <div class="field"><label for="f-pnl">Profit or loss ($)</label><input id="f-pnl" type="number" inputmode="decimal" step="0.01" value="${+t.pnl||0}"></div></div>
 <div class="field"><label>Timeframe</label>${opts("tf",[["5m","5m"],["15m","15m"],["1h","1h"],["Other","Other"]],["5m","15m","1h"].includes(t.tf)?t.tf:"Other")}</div>
 <div class="field"><label>Side</label>${opts("side",[["Up","Up"],["Down","Down"],["","None"]],t.side||"")}</div>
 <div class="field"><label for="f-title">Market</label><input id="f-title" value="${esc(t.title)}" autocomplete="off"></div>
 <div class="field"><label for="f-ts">When</label><input id="f-ts" type="datetime-local" value="${toLocalInput(t.ts)}"></div>
 <div class="field"><label for="f-note">Note</label><textarea id="f-note" style="min-height:80px" placeholder="Why you took it, what you learned">${esc(t.note||"")}</textarea></div>
 <div class="btns"><button class="action p" id="f-save">${isNew?"Add trade":"Save changes"}</button>${isNew?"":`<button class="action danger" id="f-del">Delete</button>`}</div><div id="f-conf"></div>`,
 root=>{bindOpts(root,(n,v)=>{if(n==="res"){const p=root.querySelector("#f-pnl"),c=+root.querySelector("#f-cost").value||0;let x=+p.value||0;if(v==="win"&&x<=0)x=Math.abs(x)||c;if(v==="loss"&&x>=0)x=-(Math.abs(x)||c);if(v==="open")x=0;p.value=x}});
  root.querySelector("#f-save").onclick=()=>{const res=optVal(root,"res");let pnl=+root.querySelector("#f-pnl").value||0;if(res==="loss"&&pnl>0)pnl=-pnl;if(res==="win"&&pnl<0)pnl=-pnl;
   Object.assign(t,{res,pnl:Math.round(pnl*100)/100,cost:+root.querySelector("#f-cost").value||0,tf:optVal(root,"tf"),side:optVal(root,"side"),title:root.querySelector("#f-title").value.trim()||S.settings.label[a],ts:new Date(root.querySelector("#f-ts").value).getTime()||t.ts,note:root.querySelector("#f-note").value.trim()});
   if(t.src==="sync")t.edited=true;if(isNew){S.trades[a].push(t);addXP(5)}save();closeSheet();renderTrades();renderCards();toast(isNew?"Trade added":"Trade updated")};
  const del=root.querySelector("#f-del");if(del)del.onclick=()=>{if(!del.dataset.sure){del.dataset.sure=1;del.textContent="Tap again to delete";root.querySelector("#f-conf").innerHTML=`<div class="confirm">${t.src==="sync"?"This hides the trade. It won't come back on the next sync. You can restore hidden trades in Settings.":"This removes the trade for good."}</div>`;return}
   if(t.src==="sync")t.hidden=true;else S.trades[a]=S.trades[a].filter(x=>x.id!==t.id);save();closeSheet();renderTrades();renderCards();toast("Trade deleted")}})}

/* ================= today ================= */
/* ---- time awareness ---- */
const nowMin=()=>{const d=new Date();return d.getHours()*60+d.getMinutes()};
const startDay=()=>dkey(new Date(S.created||Date.now())),startMin=()=>{const d=new Date(S.created||Date.now());return d.getHours()*60+d.getMinutes()};
const fmtIn=m=>m<60?m+" min":Math.floor(m/60)+" h"+(m%60?" "+m%60+" min":"");
function timing(k=dkey()){const list=tasksFor(k),dd=S.days[k]||{done:{}},today=k===dkey(),past=k<dkey(),nm=today?nowMin():past?99999:-1;
 const Ts=list.map(t=>tmin(t.time)).filter(x=>x<9998).sort((a,b)=>a-b);
 return list.map(t=>{const T=tmin(t.time),timed=T<9998,next=timed?Ts.find(x=>x>T):undefined,dl=timed?Math.min(T+120,Math.max(T+30,next??T+60)):1440;
  const done=!!dd.done[t.id],at=(dd.doneAt||{})[t.id];let st;
  if(done)st=(dd.late||{})[t.id]||(at&&timed&&today&&(new Date(at).getHours()*60+new Date(at).getMinutes())>dl)?"late":"done";
  else if(t.optional)st="optional";
  else if(k===startDay()&&timed&&T<startMin())st="pre";
  else if(past)st=k<startDay()?"pre":"missed";
  else if(!timed)st="anytime";
  else if(nm<T)st="upcoming";else if(nm<dl)st="now";else st="missed";
  return{...t,T,dl,st}})}
function nextInfo(){const k=dkey(),tl=timing(k),dd=S.days[k]||{},later=dd.later||{},nm=nowMin();
 const now=tl.filter(t=>t.st==="now"&&!later[t.id]).sort((a,b)=>a.T-b.T),up=tl.filter(t=>t.st==="upcoming").sort((a,b)=>a.T-b.T),any=tl.filter(t=>t.st==="anytime"&&!later[t.id]),missed=tl.filter(t=>t.st==="missed"),
  laterL=tl.filter(t=>later[t.id]&&(t.st==="now"||t.st==="anytime"));
 if(now[0])return{t:now[0],kind:"now",sub:`Now · started ${nm-now[0].T<1?"just now":fmtIn(nm-now[0].T)+" ago"} (planned ${now[0].time}).`,then:up[0],missed,up,any};
 if(up[0]&&up[0].T-nm<=10)return{t:up[0],kind:"soon",sub:`Starts at ${up[0].time}, in ${fmtIn(up[0].T-nm)}.`,then:up[1],missed,up,any};
 if(any[0])return{t:any[0],kind:"any",sub:"Anytime today."+(up[0]?` Next on the clock: ${up[0].t} at ${up[0].time} (in ${fmtIn(up[0].T-nm)}).`:""),then:null,missed,up,any};
 if(up[0])return{t:up[0],kind:"up",sub:`Up next at ${up[0].time}, in ${fmtIn(up[0].T-nm)}.`,then:up[1],missed,up,any};
 if(laterL[0])return{t:laterL[0],kind:"any",sub:"You moved this to later.",missed,up,any};
 if(missed[0])return{t:missed[0],kind:"missed",sub:`Missed at ${missed[0].time||"earlier"}. You can still check it off.`,missed,up,any};
 return{t:null,missed,up,any}}
function pastMissed(){const out=[];for(let i=1;i<=2;i++){const d=new Date();d.setDate(d.getDate()-i);const k=dkey(d);if(k<startDay()||(S.days[k]&&S.days[k].ack))continue;
  for(const t of timing(k))if(t.st==="missed")out.push({...t,k,when:i===1?"Yesterday":d.toLocaleDateString([], {weekday:"long"})})}return out}
let doNextId=null;
function renderToday(just){const k=dkey(),dd=dayData(k),tl=timing(k),req=tl.filter(t=>!t.optional),left=req.filter(t=>!dd.done[t.id]),info=nextInfo(),nMiss=info.missed.length;
 $("prog").textContent=(req.length-left.length)+" / "+req.length;const bd=$("dbadge");bd.hidden=!left.length;bd.textContent=left.length;
 doNextId=info.t?info.t.id:null;
 $("dnt").textContent=info.t?info.t.t:tl.length?"All clear for today":"Add your first task";
 $("dncount").textContent=info.kind==="now"?"Now":info.kind==="soon"?"Starting soon":info.kind==="missed"?"Catch up":left.length?left.length+" left":"Done";
 $("dncount").className="chip"+(info.kind==="now"?" nowchip":info.kind==="missed"?" misschip":"");
 $("dnsub").textContent=info.t?info.sub+(info.then?` Then: ${info.then.t} at ${info.then.time}.`:"")+(nMiss&&info.kind!=="missed"?` ${nMiss} missed today.`:""):tl.length?"Everything's done. Your streak is safe.":"Use the box below to build your routine.";
 $("dnxp").textContent=`Level ${level()} · ${S.xp%1000} / 1000 XP`;$("dndone").hidden=$("dnskip").hidden=!info.t;
 const firstUp=tl.filter(t=>t.st==="upcoming").sort((a,b)=>a.T-b.T)[0],nm=nowMin();
 const pm=pastMissed();
 const byDay={};pm.forEach(t=>(byDay[t.k]=byDay[t.k]||[]).push(t));
 const missedHtml=pm.length?`<details class="missedbox" ${S.ui.missOpen?"open":""}><summary>Missed earlier · ${pm.length}</summary><p class="sub" style="margin:6px 0 4px">Check off anything you actually did. Finishing a day's list repairs its streak. Dismiss a day to clear the rest.</p>
  ${Object.entries(byDay).map(([dk,items])=>`<div class="row sb missday"><b>${esc(items[0].when)} · ${items.length} missed</b><button class="link" data-ack="${dk}">Dismiss</button></div>${items.map(t=>`<div class="it"><button class="main" data-past="${t.k}|${t.id}"><span class="ck"></span><span class="t">${esc(t.t)}</span></button><span class="r">${esc(t.time||"")}</span></div>`).join("")}`).join("")}</details>`:"";
 let g="";const html=tl.map(t=>{const done=t.st==="done"||t.st==="late";
  const tag=t.st==="now"?'<span class="tag now">NOW</span>':t.st==="missed"?'<span class="tag missed">MISSED</span>':firstUp&&t.id===firstUp.id?`<span class="tag">NEXT · ${fmtIn(t.T-nm)}</span>`:"";
  const head=t.g!==g?(g=t.g,`<div class="grp">${esc(g)}</div>`):"";
  return head+`<div class="it ${done?"done":""} ${t.st==="missed"?"miss":""} ${t.st==="now"?"current":""} ${t.id===just?"just":""}"><button class="main" data-id="${t.id}"><span class="ck">${done?"✓":""}</span>${tag}<span class="t">${esc(t.t)}</span></button><span class="r">${esc([t.st==="late"?"done late":"",t.steps&&t.steps.length?stepsDone(k,t)+"/"+stepList(k,t).length+(useAlt(k,t)?" gym":" steps"):"",t.time,t.rep?repLabel(t):"today",t.optional?"optional":"",t.note&&!(t.steps&&t.steps.length)?"note":""].filter(Boolean).join(" · "))}</span><button class="ed" data-ed="${t.id}" aria-label="Edit task">✎</button></div>`}).join("");
 $("tasks").innerHTML=missedHtml+(html||`<div class="empty"><b>Build your daily routine</b>Add the things you do every day. They'll come back each morning.</div>`);
 const mb=$("tasks").querySelector(".missedbox");if(mb)mb.ontoggle=()=>{S.ui.missOpen=mb.open;save()};
 $("tasks").querySelectorAll("[data-past]").forEach(b=>b.onclick=()=>{const [pk,id]=b.dataset.past.split("|");toggleTask(id,b,pk)});
 $("tasks").querySelectorAll("[data-ack]").forEach(b=>b.onclick=()=>{const dk=b.dataset.ack;dayData(dk).ack=true;save();renderToday();toast("Cleared. Those stay marked as missed.","Undo",()=>{delete dayData(dk).ack;save();renderToday()})});
 $("tasks").querySelectorAll(".main[data-id]").forEach(b=>b.onclick=()=>{const t=tl.find(x=>x.id===b.dataset.id);if(t&&t.link==="weigh"&&!dd.done[t.id])weighSheet(t.id);else if(t&&t.link==="water")openWater();else if(t&&t.link==="dogs"&&!dd.done[t.id])dogCheckIn();else if(t&&((t.steps&&t.steps.length)||t.note||t.link))openSteps(t.id);else toggleTask(b.dataset.id,b)});$("tasks").querySelectorAll("[data-ed]").forEach(b=>b.onclick=()=>editTask(b.dataset.ed));
 $("streaklbl").textContent=streak()+(streak()===1?" day":" days")}
function toggleTask(id,el,k=dkey()){const dd=dayData(k);dd.done[id]=!dd.done[id];if(!dd.done[id])delete dd.done[id];addXP(dd.done[id]?10:-10,el);
 dd.doneAt=dd.doneAt||{};dd.late=dd.late||{};if(dd.done[id]){dd.doneAt[id]=Date.now();if(k!==dkey())dd.late[id]="late"}else{delete dd.doneAt[id];delete dd.late[id]}
 const rt=S.routine.find(r=>r.id===id);if(rt&&rt.link==="freezer"&&S.dogs&&k===dkey()){S.dogs.freezer=Math.max(0,(S.dogs.freezer||0)+(dd.done[id]?-1:1))}
 const was=dd.complete;dd.complete=isComplete(k);const s=streak();if(s>S.best)S.best=s;save();renderToday(dd.done[id]&&k===dkey()?id:null);renderWeek();renderCards();
 if(k!==dkey()){toast(dd.complete&&!was?"That day is complete now. Streak: "+s+" days.":dd.done[id]?"Checked off (done late)":"Unchecked");return}
 if(dd.complete&&!was){toast("Day cleared. "+s+"-day streak.");burst(el)}else if(dd.done[id])toast("+10 XP")}
function editTask(id){const k=dkey(),r=S.routine.find(x=>x.id===id),ex=dayData(k).extra.find(x=>x.id===id),t=r||ex;if(!t)return;
 const weekly=!!(r&&r.dow&&r.dow.length&&r.dow.length<7),sel=new Set(weekly?r.dow:[dowOf(k)]);
 openSheet(`<h2>Edit task</h2><p class="desc">${r?(weekly?"Repeats on "+esc(repLabel(r))+".":"Part of your daily routine."):"Today only."}</p>
 <div class="field"><label for="t-t">Task</label><input id="t-t" value="${esc(t.t)}" autocomplete="off"></div>
 <div class="field"><label for="t-time">Time (optional)</label><input id="t-time" value="${esc(t.time||"")}" placeholder="6:30 AM"></div>
 <div class="field"><label>Repeat</label>${opts("rep",[["daily","Every day"],["weekly","Certain days"],["once","Today only"]],r?(weekly?"weekly":"daily"):"once")}</div>
 <div class="field" id="t-days" ${weekly?"":"hidden"}><label>On these days</label><div class="opts days">${DOW.map((d,i)=>`<button type="button" data-d="${i}" class="${sel.has(i)?"on":""}">${d}</button>`).join("")}</div></div>
 <div class="field"><label>Part of the day</label>${opts("g",GROUPS.map(x=>[x,x]),t.g||"Anytime")}</div>
 <div class="field"><label for="t-steps">Checklist steps (one per line, optional)</label><textarea id="t-steps" style="min-height:110px" placeholder="Wash with shampoo&#10;Apply conditioner">${esc((t.steps||[]).join("\n"))}</textarea></div>
 <div class="field"><label for="t-note">Note (optional)</label><textarea id="t-note" style="min-height:70px">${esc(t.note||"")}</textarea></div>
 <div class="field"><label><input type="checkbox" id="t-opt" ${t.optional?"checked":""} style="width:auto;margin-right:8px">Optional (doesn't count toward your streak)</label></div>
 <div class="btns"><button class="action p" id="t-save">Save</button><button class="action danger" id="t-del">${r?"Remove from routine":"Delete"}</button></div>`,
 root=>{bindOpts(root,(n,v)=>{if(n==="rep")root.querySelector("#t-days").hidden=v!=="weekly"});
  root.querySelectorAll(".days button").forEach(b=>b.onclick=()=>b.classList.toggle("on"));
  root.querySelector("#t-save").onclick=()=>{const nt={...t,id:t.id,t:root.querySelector("#t-t").value.trim()||t.t,time:root.querySelector("#t-time").value.trim(),g:optVal(root,"g")};const rep=optVal(root,"rep");
   for(const f of ["dow","steps","note","optional","rep"])delete nt[f];
   const steps=root.querySelector("#t-steps").value.split("\n").map(x=>x.trim()).filter(Boolean),note=root.querySelector("#t-note").value.trim();if(steps.length)nt.steps=steps;if(note)nt.note=note;if(root.querySelector("#t-opt").checked)nt.optional=true;
   const days=[...root.querySelectorAll(".days button.on")].map(b=>+b.dataset.d);if(rep==="weekly"){if(!days.length){toast("Pick at least one day");return}if(days.length<7)nt.dow=days}
   S.routine=S.routine.filter(x=>x.id!==id);const dd=dayData(k);dd.extra=dd.extra.filter(x=>x.id!==id);if(rep==="once")dd.extra.push(nt);else S.routine.push(nt);save();closeSheet();renderToday();renderWeek();renderCards();toast("Task saved")};
  root.querySelector("#t-del").onclick=()=>{S.routine=S.routine.filter(x=>x.id!==id);const dd=dayData(k);dd.extra=dd.extra.filter(x=>x.id!==id);delete dd.done[id];save();closeSheet();renderToday();renderWeek();renderCards();toast("Task removed")}})}
$("addf").onsubmit=e=>{e.preventDefault();const v=$("nt").value.trim();if(!v)return;const rep=$("rep").value,wd=dowOf(dkey()),t={id:uid(),t:v,time:"",g:rep==="weekly"?"Weekly":"Anytime"};
 if(rep==="once")dayData(dkey()).extra.push(t);else{if(rep==="weekly")t.dow=[wd];S.routine.push(t)}
 const dd=dayData(dkey());dd.complete=isComplete(dkey());$("nt").value="";save();renderToday();renderWeek();renderCards();toast(rep==="daily"?"Added to your routine":rep==="weekly"?"Added for every "+DOWL[wd].slice(0,-1):"Added for today")};
function syncRepSelect(){const o=$("rep").querySelector('[value=weekly]');if(o)o.textContent="Every "+DOWL[dowOf(dkey())].slice(0,-1)}
$("dndone").onclick=e=>{const k=dkey(),t=tasksFor(k).find(x=>x.id===doNextId);if(!t)return;if(t.link==="water")return openWater();if(t.link==="dogs")return dogCheckIn();if(t.link==="weigh")weighSheet(t.id);else if(t.steps&&t.steps.length)openSteps(t.id);else toggleTask(t.id,e.currentTarget)};
$("dnskip").onclick=()=>{const k=dkey(),dd=dayData(k),list=tasksFor(k).filter(x=>!x.optional&&!dd.done[x.id]);if(list.length<2||!doNextId){toast("It's the last one left");return}
 (dd.later=dd.later||{})[doNextId]=true;save();renderToday();renderCards();toast("Moved to the end of today")};

/* ================= journal ================= */
const bookName=k=>k==="gratitude"?(S.settings.book5||"Gratitude"):BOOKS.find(b=>b[0]===k)[1];
let bookArt=null;
function renderJournal(){if(!bookArt)bookArt=BOOKS.map((b,i)=>{const cv=document.createElement("canvas");paintScene(cv,[2,1,0,4,3][i],560,360,i*17+3);return cv.toDataURL("image/jpeg",.72)});
 $("books").innerHTML=BOOKS.map((b,i)=>`<button class="book ${b[0]===S.ui.book?"on":""}" data-b="${b[0]}" style="background-image:url(${bookArt[i]})"><div class="lab"><b>${esc(bookName(b[0]))}</b><small>${S.journal[b[0]].length} ${S.journal[b[0]].length===1?"entry":"entries"}</small></div></button>`).join("");
 $("books").querySelectorAll(".book").forEach(b=>b.onclick=()=>{S.ui.book=b.dataset.b;save();renderJournal()});
 const k=S.ui.book,hint=BOOKS.find(b=>b[0]===k)[2],list=[...S.journal[k]].sort((a,b)=>b.ts-a.ts);
 $("jpanel").innerHTML=`<div class="row sb"><div><div class="eyebrow">${esc(bookName(k))}</div><div class="h1" style="font-size:30px">${esc(hint)}</div></div><button class="action p" id="newentry">New entry</button></div>
 <form class="add" id="qentry"><input id="ne" placeholder="Quick note… (tap New entry for more room)" aria-label="Quick entry" autocomplete="off"><button class="action">Save</button></form>
 ${list.length?list.map(e=>`<button class="entry" data-id="${e.id}"><h4>${esc(e.title||"Untitled")}</h4>${e.body?`<p>${esc(e.body)}</p>`:""}<div class="when">${whenStr(e.ts)}${e.mood!=null&&e.mood!==""?`<span class="mood">${MOODS[e.mood]}</span>`:""}</div></button>`).join(""):`<div class="empty"><b>Nothing here yet</b>${k==="dreams"?"Write down last night's dream before it fades.":"Your entries will show up here, newest first."}</div>`}`;
 $("newentry").onclick=()=>editEntry(k);$("jpanel").querySelectorAll(".entry").forEach(b=>b.onclick=()=>editEntry(k,b.dataset.id));
 $("qentry").onsubmit=e=>{e.preventDefault();const v=$("ne").value.trim();if(!v)return;S.journal[k].push({id:uid(),title:v.length>60?v.slice(0,57)+"…":v,body:v.length>60?v:"",ts:Date.now()});addXP(5);save();renderJournal();renderCards();toast("Saved · +5 XP")}}
function editEntry(k,id){const isNew=!id,e=isNew?{id:uid(),title:"",body:"",ts:Date.now(),mood:k==="emotions"?2:null}:S.journal[k].find(x=>x.id===id);if(!e)return;
 openSheet(`<h2>${isNew?"New":"Edit"} ${esc(bookName(k).toLowerCase())} entry</h2><p class="desc">${whenStr(e.ts)}</p>
 ${k==="emotions"?`<div class="field"><label>How do you feel?</label>${opts("mood",MOODS.map((m,i)=>[String(i),m]),String(e.mood??2))}</div>`:""}
 <div class="field"><label for="e-t">Title</label><input id="e-t" value="${esc(e.title)}" placeholder="${k==="dreams"?"Flying over the ocean":k==="ideas"?"App for traders":"A few words"}" autocomplete="off"></div>
 <div class="field"><label for="e-b">Write it down</label><textarea id="e-b" placeholder="Everything you remember…">${esc(e.body)}</textarea></div>
 <div class="btns"><button class="action p" id="e-save">${isNew?"Save · +5 XP":"Save changes"}</button>${isNew?"":`<button class="action danger" id="e-del">Delete</button>`}</div>`,
 root=>{bindOpts(root);root.querySelector("#e-save").onclick=()=>{const title=root.querySelector("#e-t").value.trim(),body=root.querySelector("#e-b").value.trim();if(!title&&!body){toast("Write something first");return}
   Object.assign(e,{title:title||(body.split("\n")[0].slice(0,57)),body,mood:k==="emotions"?+optVal(root,"mood"):null});if(isNew){S.journal[k].push(e);addXP(5)}save();closeSheet();renderJournal();renderCards();toast(isNew?"Saved · +5 XP":"Entry updated")};
  const d=root.querySelector("#e-del");if(d)d.onclick=()=>{if(!d.dataset.sure){d.dataset.sure=1;d.textContent="Tap again to delete";return}S.journal[k]=S.journal[k].filter(x=>x.id!==e.id);save();closeSheet();renderJournal();renderCards();toast("Entry deleted")}})}

/* ================= food ================= */
const daysBetween=(a,b)=>Math.round((new Date(b+"T12:00:00")-new Date(a+"T12:00:00"))/864e5);
const mealWeek=(k=dkey())=>{const d=daysBetween(MEAL_START,k);return d<0?1:Math.floor(d/7)%4+1};
const weekStartOf=(k=dkey())=>{const d=Math.max(0,daysBetween(MEAL_START,k)),s=new Date(MEAL_START+"T12:00:00");s.setDate(s.getDate()+Math.floor(d/7)*7);return dkey(s)};
const recipeFor=(role,k=dkey())=>S.food.recipes.find(r=>r.who==="me"&&r.role===role&&r.week===mealWeek(k));
const ROLE_ORDER=["breakfast","prepA","prepB","drink","lesson"];
let foodArt={};
function artFor(r){const map=r.who==="dog"?{Meal:3,Treat:1,Topper:0}:{Breakfast:1,"Meal prep":0,Drinks:4,Lessons:3,Other:2};const pi=map[r.cat]??2;
 if(!foodArt[pi]){const cv=document.createElement("canvas");paintScene(cv,pi,480,300,pi*11+5);foodArt[pi]=cv.toDataURL("image/jpeg",.7)}return foodArt[pi]}
function weightStats(){const e=Object.entries(S.weights||{}).sort((a,b)=>a[0]<b[0]?-1:1);if(!e.length)return null;const today=dkey();
 const avg=(from,to)=>{const v=e.filter(([k])=>{const d=daysBetween(k,today);return d>=from&&d<=to}).map(x=>x[1]);return v.length?v.reduce((s,x)=>s+x,0)/v.length:null};
 const a7=avg(0,6),p7=avg(7,13),last=e[e.length-1];let msg="Keep weighing in every morning. Guidance starts after two weeks of entries.",tone="";
 if(a7!==null&&p7!==null){const ch=a7-p7;if(ch<0.25){msg=`7-day average ${ch>=0?"up":"down"} ${Math.abs(ch).toFixed(2)} lb. Below target: add about 200–250 calories a day.`;tone="dn"}else if(ch>0.75){msg=`7-day average up ${ch.toFixed(2)} lb. Faster than planned: if your waist is growing, ease off slightly.`;tone="dn"}else{msg=`7-day average up ${ch.toFixed(2)} lb. Right in the +0.25–0.75 lb target.`;tone="up"}}
 return{last,a7,p7,msg,tone,count:e.length}}
function renderFood(){const who=S.ui.who||"me",cats=FOOD_CATS[who];if(!cats.includes(S.ui.fcat))S.ui.fcat="All";
 document.querySelectorAll("#who button").forEach(b=>b.classList.toggle("on",b.dataset.w===who));requestAnimationFrame(()=>segPlace("who"));
 $("fcats").innerHTML=["All","★ Favorites",...cats].map(c=>`<button class="chip ${S.ui.fcat===c?"on":""}" data-c="${esc(c)}">${esc(c)}</button>`).join("");
 $("fcats").querySelectorAll(".chip").forEach(b=>b.onclick=()=>{S.ui.fcat=b.dataset.c;save();renderFood()});
 if(who==="dog"){$("dogsafe").innerHTML=dogDashboard()+`<details class="panel safe" ${S.ui.safeSeen?"":"open"}><summary>Dog food safety</summary><div style="margin-top:10px">${DOG_SAFE}</div></details>`;$("dogsafe").querySelector("details.safe").ontoggle=e=>{if(!e.target.open){S.ui.safeSeen=1;save()}};bindDogDashboard()}
 else{const wk=mealWeek(),ws=weekStartOf(),we=new Date(ws+"T12:00:00");we.setDate(we.getDate()+6);const st=weightStats();
  $("dogsafe").innerHTML=`<div class="grid foodgrid"><div class="panel col2 menu"><div class="row sb"><div><div class="eyebrow">This week · Week ${wk} of 4</div><div class="h1" style="font-size:28px;margin-bottom:4px">${esc(MENU_THEMES[wk-1])} week</div><div class="sub">${new Date(ws+"T12:00:00").toLocaleDateString([], {month:"short",day:"numeric"})} – ${we.toLocaleDateString([], {month:"short",day:"numeric"})}</div></div><button class="action" id="grocbtn">Grocery list</button></div>
   <div class="menulist">${ROLE_ORDER.map(role=>{const r=recipeFor(role);return r?`<button class="mrow" data-id="${r.id}"><small>${esc(ROLE_LABEL[role])}</small><b>${esc(r.name)}</b><span aria-hidden="true">→</span></button>`:""}).join("")}</div>
   <details class="targets"><summary>Daily targets and rules</summary><div>${MEAL_TARGETS}</div></details></div>
   <div class="panel wcard"><span class="eyebrow">Morning weight</span><div class="big" style="font-size:40px">${st?st.last[1].toFixed(1)+" lb":"–"}</div>
   <div class="sub">${st?(st.a7!==null?"7-day average "+st.a7.toFixed(1)+" lb · ":"")+st.count+" entries":"Start: about 148 lb"}</div>
   <p class="sub ${st?st.tone:""}" style="margin-top:8px">${st?esc(st.msg):"Log your first weigh-in to start tracking."}</p><button class="action p" id="weighbtn" style="margin-top:12px">Log today's weight</button></div></div>`;
  $("grocbtn").onclick=()=>grocerySheet();$("weighbtn").onclick=()=>weighSheet();$("dogsafe").querySelectorAll(".mrow").forEach(b=>b.onclick=()=>openRecipe(b.dataset.id))}
 const q=($("fsearch").value||"").trim().toLowerCase();
 let list=S.food.recipes.filter(r=>r.who===who&&(S.ui.fcat==="All"||(S.ui.fcat==="★ Favorites"?r.fav:r.cat===S.ui.fcat))&&(!q||(r.name+" "+(r.ingredients||[]).join(" ")).toLowerCase().includes(q)));
 list.sort((a,b)=>(b.fav-a.fav)||((a.week||9)-(b.week||9))||(ROLE_ORDER.indexOf(a.role)-ROLE_ORDER.indexOf(b.role))||a.name.localeCompare(b.name));
 $("recipes").innerHTML=list.length?list.map(r=>`<button class="rcard" data-id="${r.id}" style="background-image:url(${artFor(r)})"><span class="rlab"><small>${esc(r.week?"Week "+r.week+" · "+MENU_THEMES[r.week-1]:r.cat)}</small><b>${esc(r.name)}</b><small>${esc([r.week?ROLE_LABEL[r.role].replace(/^Meal \d · /,""):"",r.time,r.serves?"serves "+r.serves:""].filter(Boolean).join(" · "))}</small></span>${r.fav?'<span class="fav" aria-label="Favorite">★</span>':""}</button>`).join("")
  :`<div class="panel empty"><b>${q?"No recipes match that search":"No recipes here yet"}</b>Tap + New recipe to add one.</div>`;
 $("recipes").querySelectorAll(".rcard").forEach(b=>b.onclick=()=>openRecipe(b.dataset.id))}
$("fsearch").addEventListener("input",()=>renderFood());
document.querySelectorAll("#who button").forEach(b=>b.onclick=()=>{S.ui.who=b.dataset.w;S.ui.fcat="All";save();renderFood()});
$("newrecipe").onclick=()=>editRecipe();
function openRecipe(id){const r=S.food.recipes.find(x=>x.id===id);if(!r)return;const tick={i:{},s:{}};
 const draw=root=>{root.innerHTML=`<div class="grab"></div><div class="rhero" style="background-image:url(${artFor(r)})"></div><h2>${esc(r.name)}</h2>
  <p class="desc">${esc([r.who==="dog"?"For the dogs":"",r.week?"Week "+r.week+" · "+MENU_THEMES[r.week-1]+" · "+ROLE_LABEL[r.role]:r.cat,r.time,r.serves?"Serves "+r.serves:"",r.protein?"Protein "+r.protein:""].filter(Boolean).join(" · "))}</p>
  ${r.notes?`<div class="note">${esc(r.notes)}</div>`:""}
  ${(r.ingredients||[]).length?`<h3 class="rh">Ingredients</h3><div class="steps">${r.ingredients.map((x,i)=>`<button type="button" class="step ${tick.i[i]?"on":""}" data-k="i" data-i="${i}"><span class="ck">${tick.i[i]?"✓":""}</span><span>${esc(x)}</span></button>`).join("")}</div>`:""}
  ${(r.steps||[]).length?`<h3 class="rh">Steps</h3><div class="steps">${r.steps.map((x,i)=>`<button type="button" class="step ${tick.s[i]?"on":""}" data-k="s" data-i="${i}"><span class="ck">${tick.s[i]?"✓":i+1}</span><span>${esc(x)}</span></button>`).join("")}</div>`:""}
  <div class="btns"><button class="action p" id="r-today">Add to today</button><button class="action" id="r-fav">${r.fav?"★ Favorited":"☆ Favorite"}</button><button class="action" id="r-edit">Edit</button></div>`;
  root.querySelectorAll(".step").forEach(b=>b.onclick=()=>{const m=tick[b.dataset.k],i=+b.dataset.i;m[i]=!m[i];draw(root)});
  root.querySelector("#r-fav").onclick=()=>{r.fav=!r.fav;save();renderFood();draw(root)};
  root.querySelector("#r-edit").onclick=()=>editRecipe(r.id);
  root.querySelector("#r-today").onclick=()=>{const dd=dayData(dkey());if(dd.extra.some(e=>e.recipe===r.id)){toast("Already on today's list");return}
   dd.extra.push({id:uid(),t:(r.who==="dog"?"Make for the dogs: ":"Cook: ")+r.name,time:"",g:"Anytime",recipe:r.id,steps:[...(r.steps||[])],note:(r.ingredients||[]).length?"Ingredients: "+r.ingredients.join(", "):""});
   dd.complete=isComplete(dkey());save();renderToday();renderWeek();toast("Added to today","Open Today",()=>{closeSheet();go("today")})}};
 $("sheet").innerHTML="";$("sheetwrap").hidden=false;draw($("sheet"))}
function editRecipe(id){const isNew=!id,r=isNew?{id:uid(),who:S.ui.who||"me",name:"",cat:FOOD_CATS[S.ui.who||"me"][0],time:"",serves:"",protein:"",ingredients:[],steps:[],notes:"",fav:false,ts:Date.now()}:S.food.recipes.find(x=>x.id===id);if(!r)return;
 const catOpts=w=>opts("cat",FOOD_CATS[w].map(c=>[c,c]),FOOD_CATS[w].includes(r.cat)?r.cat:FOOD_CATS[w][0]);
 openSheet(`<h2>${isNew?"New recipe":"Edit recipe"}</h2>${r.week?`<p class="desc">Part of your Week ${r.week} meal plan.</p>`:""}
 <div class="field"><label for="r-n">Name</label><input id="r-n" value="${esc(r.name)}" placeholder="${r.who==="dog"?"Frozen yogurt pupsicles":"Honey garlic salmon"}" autocomplete="off"></div>
 <div class="field"><label>For</label>${opts("who",[["me","Me"],["dog","The dogs"]],r.who)}</div>
 <div class="field"><label>Category</label><div id="r-cats">${catOpts(r.who)}</div></div>
 <div class="pair"><div class="field"><label for="r-t">Time</label><input id="r-t" value="${esc(r.time||"")}" placeholder="25 min"></div><div class="field"><label for="r-s">Serves</label><input id="r-s" value="${esc(r.serves||"")}" placeholder="2"></div></div>
 ${r.who==="me"?`<div class="field"><label for="r-p">Protein (optional)</label><input id="r-p" value="${esc(r.protein||"")}" placeholder="40 g"></div>`:""}
 <div class="field"><label for="r-i">Ingredients (one per line)</label><textarea id="r-i" placeholder="1 lb chicken thighs&#10;2 lemons">${esc((r.ingredients||[]).join("\n"))}</textarea></div>
 <div class="field"><label for="r-st">Steps (one per line)</label><textarea id="r-st">${esc((r.steps||[]).join("\n"))}</textarea></div>
 <div class="field"><label for="r-no">Notes</label><textarea id="r-no" style="min-height:70px">${esc(r.notes||"")}</textarea></div>
 <div class="btns"><button class="action p" id="r-save">${isNew?"Add recipe":"Save changes"}</button>${isNew?"":`<button class="action danger" id="r-del">Delete</button>`}</div>`,
 root=>{bindOpts(root,(n,v)=>{if(n==="who"){root.querySelector("#r-cats").innerHTML=catOpts(v);bindOpts(root.querySelector("#r-cats"))}});
  root.querySelector("#r-save").onclick=()=>{const name=root.querySelector("#r-n").value.trim();if(!name){toast("Give the recipe a name");return}const lines=s=>root.querySelector(s).value.split("\n").map(x=>x.trim()).filter(Boolean);
   Object.assign(r,{name,who:optVal(root,"who"),cat:optVal(root,"cat"),time:root.querySelector("#r-t").value.trim(),serves:root.querySelector("#r-s").value.trim(),protein:(root.querySelector("#r-p")||{value:r.protein||""}).value.trim(),ingredients:lines("#r-i"),steps:lines("#r-st"),notes:root.querySelector("#r-no").value.trim()});
   if(isNew)S.food.recipes.push(r);S.ui.who=r.who;save();closeSheet();renderFood();toast(isNew?"Recipe added":"Recipe saved")};
  const d=root.querySelector("#r-del");if(d)d.onclick=()=>{if(!d.dataset.sure){d.dataset.sure=1;d.textContent="Tap again to delete";return}S.food.recipes=S.food.recipes.filter(x=>x.id!==r.id);save();closeSheet();renderFood();toast("Recipe deleted")}})}
function weighSheet(taskId){const st=weightStats(),k=dkey(),cur=S.weights[k];
 openSheet(`<h2>Morning weigh-in</h2><p class="desc">After the bathroom, before food or water. Goal: +0.25–0.75 lb a week.</p>
 <div class="field"><label for="wt">Weight (lb)</label><input id="wt" type="number" inputmode="decimal" step="0.1" value="${cur??(st?st.last[1]:148)}"></div>
 ${st?`<p class="sub ${st.tone}" style="margin-top:10px">${esc(st.msg)}</p>`:""}
 <div class="btns"><button class="action p" id="wt-save">Save weight</button></div>`,
 root=>{root.querySelector("#wt-save").onclick=()=>{const v=+root.querySelector("#wt").value;if(!(v>50&&v<500)){toast("Enter your weight in pounds");return}S.weights[k]=Math.round(v*10)/10;
   const t=taskId||(S.routine.find(r=>r.link==="weigh")||{}).id;const dd=dayData(k);save();closeSheet();if(t&&!dd.done[t])toggleTask(t);else toast("Weight saved");renderFood()}})}
function grocerySheet(){const k=dkey(),nextWeek=dowOf(k)===0,ref=new Date(k+"T12:00:00");if(nextWeek)ref.setDate(ref.getDate()+1);const rk=dkey(ref),wk=mealWeek(rk),ws=weekStartOf(rk);
 const ticks=S.food.grocery[ws]=S.food.grocery[ws]||{};const draw=root=>{root.innerHTML=`<div class="grab"></div><h2>Grocery list</h2><p class="desc">${nextWeek?"For next week":"For this week"}: Week ${wk}, ${esc(MENU_THEMES[wk-1])}. Tick what you've got.</p>
  <div class="note">This week's meals: ${ROLE_ORDER.map(r=>recipeFor(r,rk)).filter(Boolean).map(r=>esc(r.name)).join(" · ")}</div>
  ${Object.entries(GROCERY).map(([cat,items])=>`<h3 class="rh">${esc(cat)}</h3><div class="steps">${items.map(x=>`<button type="button" class="step ${ticks[x]?"on":""}" data-x="${esc(x)}"><span class="ck">${ticks[x]?"✓":""}</span><span>${esc(x)}</span></button>`).join("")}</div>`).join("")}
  <div class="btns"><button class="action" id="g-clear">Clear ticks</button></div>`;
  root.querySelectorAll(".step").forEach(b=>b.onclick=()=>{const x=b.dataset.x;ticks[x]=!ticks[x];if(!ticks[x])delete ticks[x];save();draw(root)});
  root.querySelector("#g-clear").onclick=()=>{for(const x in ticks)delete ticks[x];save();draw(root)}};
 $("sheet").innerHTML="";$("sheetwrap").hidden=false;draw($("sheet"))}
function linkLabel(link){if(link==="dogweigh")return "Enter weights";if(link==="dogs")return "Check in";if(link==="freezer")return "Freezer count";if(link==="dogbatch")return "Open recipe";if(link==="water")return "Log water";if(link==="weigh")return "Log weight";if(link==="grocery")return "Grocery list";if(link==="menu")return "This week's menu";const r=recipeFor(link);return r?"Open recipe":"Open Food"}
function followLink(link,id){closeSheet();if(link==="dogweigh")return dogEdit();if(link==="dogs")return dogCheckIn();if(link==="freezer"){S.ui.who="dog";return go("food")}if(link==="dogbatch"){const r=S.food.recipes.find(x=>x.name===HUSKY_RECIPE.name);return r?openRecipe(r.id):(S.ui.who="dog",go("food"))}if(link==="water")return openWater();if(link==="weigh")return weighSheet(id);if(link==="grocery")return grocerySheet();if(link==="menu"){S.ui.who="me";return go("food")}
 const r=recipeFor(link);if(r)openRecipe(r.id);else{S.ui.who="me";go("food")}}

/* ================= task alerts ================= */
function taskTick(){const k=dkey();if(S.view==="today")renderToday();if(S.view==="home")renderCards();
 if(!S.settings.taskAlerts||typeof Notification==="undefined"||Notification.permission!=="granted")return;
 const dd=dayData(k),nm=nowMin();dd.notified=dd.notified||{};
 for(const t of timing(k)){if(t.T>=9998||dd.notified[t.id]||t.st==="done"||t.st==="late"||t.st==="pre")continue;
  if(nm>=t.T&&nm<t.T+5){dd.notified[t.id]=1;save();const up=timing(k).filter(x=>x.st==="upcoming").sort((a,b)=>a.T-b.T)[0];
   navigator.serviceWorker&&navigator.serviceWorker.ready.then(r=>r.showNotification("Now: "+t.t,{body:(t.time?t.time+". ":"")+(up?`Up next: ${up.t} at ${up.time}.`:"Last timed task today."),tag:"task",renotify:true,icon:"icon-192.png",badge:"icon-192.png",data:{url:"./#today"}})).catch(()=>{})}}}
function alertsSheet(){const on=S.settings.taskAlerts&&typeof Notification!=="undefined"&&Notification.permission==="granted",timed=S.routine.filter(r=>tmin(r.time)<9998).length;
 openSheet(`<h2>Task reminders</h2><p class="desc">Get pinged when each timed task starts. ${timed} of your routine tasks have a time.</p>
 <div class="note"><b>Phone calendar (recommended).</b> Adds your timed routine as repeating calendar events with an alert at the start time. They go off even when Daily HQ is closed. Weekly tasks only repeat on their day.</div>
 <div class="btns" style="margin-top:0"><button class="action p" id="al-cal">Add my routine to my calendar</button></div>
 <p class="desc" style="margin-top:6px">If you change times later, add it again and delete the old "Daily HQ" events in your calendar.</p>
 ${typeof Notification!=="undefined"?`<div class="sec"><h3>App notifications</h3><p class="desc">"Now: Gym · Up next: AI Academy at 3:30 PM". These only arrive while Daily HQ is running in the background.</p><div class="btns" style="margin-top:8px"><button class="action" id="al-notif">${on?"On · turn off":"Turn on"}</button></div></div>`:""}`,
 root=>{root.querySelector("#al-cal").onclick=()=>routineCalendar();const nb=root.querySelector("#al-notif");if(nb)nb.onclick=async()=>{if(on){S.settings.taskAlerts=false;save();closeSheet();toast("Task notifications off");return}
  const r=await Notification.requestPermission();if(r==="granted"){S.settings.taskAlerts=true;save();closeSheet();toast("Task notifications on")}else toast("Notifications are blocked. Allow them for this app in Android settings.")}})}
function routineCalendar(){const BY=["SU","MO","TU","WE","TH","FR","SA"],stamp=new Date().toISOString().replace(/[-:]/g,"").slice(0,15)+"Z";
 const L=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Daily HQ//Routine//EN","CALSCALE:GREGORIAN"];let n=0;
 const clean=s=>String(s).replace(/[\\;,]/g,m=>"\\"+m).replace(/\n/g,"\\n");
 for(const r of S.routine){const m=tmin(r.time);if(m>=9998)continue;const hh=String(Math.floor(m/60)).padStart(2,"0"),mm=String(m%60).padStart(2,"0");
  const d=new Date();if(r.dow&&r.dow.length&&r.dow.length<7){while(!r.dow.includes(d.getDay()))d.setDate(d.getDate()+1)}const ds=dkey(d).replace(/-/g,"");n++;
  L.push("BEGIN:VEVENT",`UID:dailyhq-${r.id}@dailyhq`,`DTSTAMP:${stamp}`,`DTSTART:${ds}T${hh}${mm}00`,"DURATION:PT15M",r.dow&&r.dow.length&&r.dow.length<7?`RRULE:FREQ=WEEKLY;BYDAY=${r.dow.map(x=>BY[x]).join(",")}`:"RRULE:FREQ=DAILY",
   `SUMMARY:${clean(r.t)}`,`DESCRIPTION:${clean("Daily HQ"+(r.optional?" (optional)":"")+(r.steps&&r.steps.length?" · "+r.steps.length+" steps":""))}`,"TRANSP:TRANSPARENT","BEGIN:VALARM","ACTION:DISPLAY",`DESCRIPTION:${clean(r.t)}`,"TRIGGER:PT0M","END:VALARM","END:VEVENT")}
 L.push("END:VCALENDAR");const file=new File([L.join("\r\n")],"daily-hq-routine.ics",{type:"text/calendar"});
 const dl=()=>{const u=URL.createObjectURL(file),x=document.createElement("a");x.href=u;x.download=file.name;document.body.appendChild(x);x.click();setTimeout(()=>{URL.revokeObjectURL(u);x.remove()},1500);toast(`${n} routine reminders saved. Open the file to add them to your Calendar.`)};
 if(navigator.canShare&&navigator.canShare({files:[file]}))navigator.share({files:[file],title:"Daily HQ routine"}).then(()=>toast("Pick your Calendar app to add the reminders")).catch(e=>{if(e&&e.name!=="AbortError")dl()});else dl()}

/* ================= native Android notifications (Capacitor) ================= */
const CAP=window.Capacitor,NATIVE=!!(CAP&&CAP.isNativePlatform&&CAP.isNativePlatform()),LN=NATIVE&&CAP.Plugins?CAP.Plugins.LocalNotifications:null;
const nid=s=>{let h=7;for(const c of String(s))h=(h*31+c.charCodeAt(0))|0;return Math.abs(h)%2000000000+1};
const atDate=(k,m)=>{const d=new Date(k+"T00:00:00");d.setMinutes(m);return d};
let schedT=null,nativeReady=false;
const NOTIF_DAYS=4;
function nset(){return S.settings.notify||(S.settings.notify={start:true,missed:true,water:true,pre:0})}
function scheduleSoon(){if(!LN||!nativeReady)return;clearTimeout(schedT);schedT=setTimeout(scheduleNative,1500)}
function buildNotifs(){const N=nset(),out=[],now=Date.now()+5000;
 for(let i=0;i<NOTIF_DAYS;i++){const d=new Date();d.setDate(d.getDate()+i);const k=dkey(d),tl=timing(k),timed=tl.filter(t=>t.T<9998).sort((a,b)=>a.T-b.T);
  for(const t of timed){if(t.st==="done"||t.st==="late")continue;const nx=timed.find(x=>x.T>t.T),steps=t.steps&&t.steps.length?` · ${t.steps.length} steps`:"",extra={k,id:t.id,kind:"task"};
   const start=atDate(k,t.T);
   if(N.start&&start>now&&t.st!=="pre")out.push({id:nid(k+t.id+"s"),title:"Now: "+t.t,body:`${t.time}${steps}.${nx?` Up next: ${nx.t} at ${nx.time}.`:" Last timed task today."}`,schedule:{at:start,allowWhileIdle:true},channelId:"tasks",actionTypeId:"TASK",extra});
   if(N.pre>0){const pre=atDate(k,t.T-N.pre);if(pre>now&&t.st!=="pre")out.push({id:nid(k+t.id+"p"),title:`In ${N.pre} min: ${t.t}`,body:`Starts at ${t.time}${steps}.`,schedule:{at:pre,allowWhileIdle:true},channelId:"tasks",actionTypeId:"TASK",extra})}
   const dl=atDate(k,t.dl);if(N.missed&&!t.optional&&t.st!=="pre"&&dl>now)out.push({id:nid(k+t.id+"m"),title:"Missed: "+t.t,body:`Planned for ${t.time}. Tap Done if you did it, or check it off late in Today.`,schedule:{at:dl,allowWhileIdle:true},channelId:"missed",actionTypeId:"MISSED",extra})}
  if(N.water&&!(i===0&&waterToday()>=W().goal)){for(let m=tmin(W().start);m<=tmin(W().end);m+=W().every){const at=atDate(k,m);if(at>now)out.push({id:nid(k+"w"+m),title:"💧 Time for water",body:`Log ${W().step} ml. Goal ${fmtL(W().goal)} today.`,schedule:{at,allowWhileIdle:true},channelId:"water",actionTypeId:"WATER",extra:{k,kind:"water"}})}}}
 out.sort((a,b)=>a.schedule.at-b.schedule.at);return out.slice(0,400)}
async function scheduleNative(){if(!LN)return;try{const list=buildNotifs();const p=await LN.getPending();
  if(p&&p.notifications&&p.notifications.length)await LN.cancel({notifications:p.notifications.map(n=>({id:n.id}))});
  if(list.length)await LN.schedule({notifications:list.map(n=>({...n,smallIcon:"ic_stat_dailyhq",iconColor:"#EFBC90"}))});
  S.native={...(S.native||{}),count:list.length,at:Date.now(),next:list[0]?{t:list[0].title,at:+list[0].schedule.at}:null};try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}catch(e){console.warn("schedule failed",e)}}
async function nativeInit(){if(!LN)return;try{
 for(const c of [{id:"tasks",name:"Tasks: now and next",importance:4},{id:"missed",name:"Missed tasks",importance:4},{id:"water",name:"Water reminders",importance:3}])await LN.createChannel({...c,visibility:1,vibration:true,lights:true,lightColor:"#EFBC90"}).catch(()=>{});
 await LN.registerActionTypes({types:[{id:"TASK",actions:[{id:"done",title:"Done"},{id:"snooze",title:"Snooze 10 min"}]},{id:"MISSED",actions:[{id:"done",title:"Done (late)"}]},{id:"WATER",actions:[{id:"log",title:`Log ${W().step} ml`}]}]});
 const perm=await LN.checkPermissions();if(perm.display!=="granted")await LN.requestPermissions();
 LN.addListener("localNotificationActionPerformed",ev=>setTimeout(()=>handleNotif(ev),300));
 nativeReady=true;await scheduleNative()}catch(e){console.warn("native init failed",e)}}
function handleNotif(ev){const n=ev.notification||{},x=n.extra||{},a=ev.actionId;closeSheet();orbit(false);
 if(x.kind==="water"){if(a==="log")addWater(W().step);else{go("today");openWater()}return}
 if(!x.id)return;const dd=dayData(x.k),t=tasksFor(x.k).find(y=>y.id===x.id);
 if(a==="done"){if(!dd.done[x.id])toggleTask(x.id,null,x.k);go("today");toast("Checked off: "+(t?t.t:"task"));return}
 if(a==="snooze"&&LN){LN.schedule({notifications:[{id:nid(x.id+Date.now()),title:n.title,body:n.body,channelId:"tasks",actionTypeId:"TASK",extra:x,smallIcon:"ic_stat_dailyhq",iconColor:"#EFBC90",schedule:{at:new Date(Date.now()+600000),allowWhileIdle:true}}]});toast("Snoozed for 10 minutes");return}
 go("today");if(t&&x.k===dkey()&&((t.steps&&t.steps.length)||t.note||t.link))setTimeout(()=>{if(t.link==="water")openWater();else if(t.link==="dogs")dogCheckIn();else openSteps(t.id)},450)}
function nativeAlertsSheet(){const N=nset(),nx=S.native&&S.native.next;
 openSheet(`<h2>Notifications</h2><p class="desc">Scheduled on your phone, so they arrive even when Daily HQ is closed. ${S.native?S.native.count+" coming up over the next "+NOTIF_DAYS+" days.":""}${nx?` Next: “${esc(nx.t)}” at ${new Date(nx.at).toLocaleString([], {weekday:"short",hour:"numeric",minute:"2-digit"})}.`:""}</p>
 <div class="field"><label><input type="checkbox" id="nt-start" ${N.start?"checked":""} style="width:auto;margin-right:8px">When each task starts, with what's up next</label></div>
 <div class="field"><label>Heads-up before each task</label>${opts("pre",[["0","Off"],["5","5 min"],["10","10 min"],["15","15 min"]],String(N.pre||0))}</div>
 <div class="field"><label><input type="checkbox" id="nt-missed" ${N.missed?"checked":""} style="width:auto;margin-right:8px">When I miss a task (skipped if I already checked it off)</label></div>
 <div class="field"><label><input type="checkbox" id="nt-water" ${N.water?"checked":""} style="width:auto;margin-right:8px">Water reminders (${esc(W().start)}–${esc(W().end)}, every ${W().every} min, stop once I hit ${fmtL(W().goal)})</label></div>
 <div class="btns"><button class="action p" id="nt-save">Save</button><button class="action" id="nt-test">Send a test in 5 seconds</button></div>
 <p class="desc" style="margin-top:12px">Notifications have buttons: Done, Snooze 10 min, and Log ${W().step} ml. If they don't arrive, open Android Settings → Apps → Daily HQ → Notifications and make sure they're allowed, and set Battery to Unrestricted.</p>`,
 root=>{bindOpts(root);root.querySelector("#nt-save").onclick=async()=>{Object.assign(N,{start:root.querySelector("#nt-start").checked,missed:root.querySelector("#nt-missed").checked,water:root.querySelector("#nt-water").checked,pre:+optVal(root,"pre")||0});save();await scheduleNative();closeSheet();toast(`Saved · ${S.native.count} notifications scheduled`)};
  root.querySelector("#nt-test").onclick=async()=>{const perm=await LN.checkPermissions();if(perm.display!=="granted"){const r=await LN.requestPermissions();if(r.display!=="granted"){toast("Notifications are off for Daily HQ in Android settings");return}}
   const nx2=nextInfo();await LN.schedule({notifications:[{id:nid("test"+Date.now()),title:nx2.t?"Now: "+nx2.t.t:"Daily HQ test",body:"This is how your reminders will look.",channelId:"tasks",actionTypeId:"TASK",extra:nx2.t?{k:dkey(),id:nx2.t.id,kind:"task"}:{},smallIcon:"ic_stat_dailyhq",iconColor:"#EFBC90",schedule:{at:new Date(Date.now()+5000),allowWhileIdle:true}}]});toast("Test coming in 5 seconds. You can close the app.")}})}

/* ================= smoke log ================= */
const MOODS_SMOKE=["Boredom","Stress","Anxiety","Habit","Craving","After eating","With friends","Tired","Bad mood","Work break","Waking up","Celebrating"];
const SM=()=>S.smoke||(S.smoke={sessions:[],urges:[],active:null});
const mmss=s=>{s=Math.max(0,Math.floor(s));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return (h?h+":"+String(m).padStart(2,"0"):m)+":"+String(x).padStart(2,"0")};
const sinceStr=ms=>{const m=Math.floor(ms/60000);if(m<1)return "just now";if(m<60)return m+" min";const h=Math.floor(m/60);if(h<48)return h+" h "+(m%60)+" min";return Math.floor(h/24)+" days"};
let smokeTimer=null,smokeLimitT=null;
const SMOKE_NOTIF_ID=777001;
function chipPicker(sel,list){return `<div class="chips wrap moodpick">${list.map(m=>`<button type="button" class="chip ${sel.includes(m)?"on":""}" data-m="${esc(m)}">${esc(m)}</button>`).join("")}</div>`}
function bindChips(root,arr,cb){root.querySelectorAll(".moodpick .chip").forEach(b=>b.onclick=()=>{const m=b.dataset.m,i=arr.indexOf(m);if(i>=0)arr.splice(i,1);else arr.push(m);b.classList.toggle("on");cb&&cb()})}
function smokeStats(){const X=SM(),now=Date.now(),day=864e5,ss=X.sessions;const last=ss.length?Math.max(...ss.map(s=>s.end||s.start)):null;
 const inRange=(a,b)=>ss.filter(s=>s.start>=now-a&&s.start<now-b),puffs=l=>l.reduce((t,s)=>t+(s.puffs||0),0);
 const today=ss.filter(s=>sameDay(s.start)),w=inRange(7*day,0),pw=inRange(14*day,7*day);
 const reasons={};ss.filter(s=>s.start>now-30*day).forEach(s=>(s.moods||[]).forEach(m=>reasons[m]=(reasons[m]||0)+1));X.urges.filter(u=>u.ts>now-30*day).forEach(u=>(u.moods||[]).forEach(m=>reasons[m]=(reasons[m]||0)+1));
 const top=Object.entries(reasons).sort((a,b)=>b[1]-a[1]).slice(0,3);
 const resisted=X.urges.filter(u=>u.outcome==="passed"&&u.ts>now-7*day).length;
 const days=[...Array(7)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);return[d.toLocaleDateString([], {weekday:"narrow"}),puffs(ss.filter(s=>sameDay(s.start,d)))]});
 return{last,today:{n:today.length,p:puffs(today)},week:puffs(w),prev:puffs(pw),weekN:w.length,resisted,top,days}}
function renderSmoke(){const X=SM(),a=X.active,st=smokeStats();clearInterval(smokeTimer);
 const s=$("smokesession");
 if(a){s.innerHTML=`<div class="row sb"><div><span class="eyebrow">Session in progress</span><div class="sclock" id="sclock">${mmss((Date.now()-a.start)/1000)}</div><div class="sub" id="slimit">${a.limit?`Timer set for ${a.limit} min`:"No time limit"}</div></div><button class="action danger" id="s-end">End session</button></div>
  <div class="puffs"><button class="puffbtn minus" id="p-minus" aria-label="Remove a puff">−</button><div><b id="pcount">${a.puffs}</b><small>puff${a.puffs===1?"":"s"}</small></div><button class="puffbtn" id="p-plus" aria-label="Add a puff">+1 puff</button></div>
  <div class="field"><label>Why now?</label>${chipPicker(a.moods,MOODS_SMOKE)}</div>
  <div class="field"><label for="s-notes">Notes</label><textarea id="s-notes" style="min-height:70px" placeholder="Where you are, how you feel, what set it off">${esc(a.notes||"")}</textarea></div>`;
  const upd=()=>{$("pcount").textContent=a.puffs;save()};$("p-plus").onclick=e=>{a.puffs++;upd();e.currentTarget.animate([{transform:"scale(1)"},{transform:"scale(.93)"},{transform:"scale(1)"}],{duration:180});try{navigator.vibrate&&navigator.vibrate(15)}catch(x){}};
  $("p-minus").onclick=()=>{if(a.puffs>0){a.puffs--;upd()}};bindChips(s,a.moods,save);$("s-notes").oninput=e=>{a.notes=e.target.value;save()};$("s-end").onclick=()=>endSmoke();
  smokeTimer=setInterval(()=>{const el=$("sclock");if(!el){clearInterval(smokeTimer);return}const secs=(Date.now()-a.start)/1000;el.textContent=mmss(secs);if(a.limit&&secs>=a.limit*60){el.classList.add("over");$("slimit").textContent=`${a.limit} min is up`}},1000)}
 else{const lim=S.ui.smokeLimit??5;s.innerHTML=`<span class="eyebrow">Log a session</span><div class="h1" style="font-size:28px">Start when you light up</div><p class="sub">The timer runs while you smoke. Tap +1 for each puff, pick why, and end the session when you're done.</p>
  <div class="field"><label>Timer</label>${opts("lim",[["0","No limit"],["3","3 min"],["5","5 min"],["10","10 min"]],String(lim))}<span class="hint">You'll get a buzz and a notification when the time is up.</span></div>
  <div class="btns"><button class="action p big-btn" id="s-start" style="flex:2">Start session</button><button class="action big-btn" id="s-past" style="flex:1;font-size:13px">Log one I forgot</button></div>`;
  bindOpts(s,(n,v)=>{S.ui.smokeLimit=+v;save()});$("s-start").onclick=()=>startSmoke(S.ui.smokeLimit??5);$("s-past").onclick=()=>editSmoke()}
 const delta=st.week-st.prev;
 $("smokestats").innerHTML=`<span class="eyebrow">Since your last one</span><div class="big" style="font-size:38px">${st.last?sinceStr(Date.now()-st.last):"—"}</div>
  <div class="stats" style="margin-top:12px"><div class="stat"><small>Today</small><b>${st.today.p} <span class="unit">puffs</span></b></div><div class="stat"><small>This week</small><b>${st.week} <span class="unit">puffs</span></b></div>
  <div class="stat"><small>vs last week</small><b class="${delta>0?"dn":delta<0?"up":""}">${st.prev||st.week?(delta>0?"+":"")+delta:"—"}</b></div><div class="stat"><small>Urges beaten</small><b class="up">${st.resisted}</b></div></div>
  <div class="wweek" style="margin-top:14px;height:70px">${(()=>{const mx=Math.max(1,...st.days.map(d=>d[1]));return st.days.map(([d,p])=>`<div><i style="height:${p/mx*100}%;background:#B7A3E0"></i><small>${d}</small></div>`).join("")})()}</div>
  <div class="sub" style="margin-top:10px">${st.top.length?"Top reasons this month: "+st.top.map(([m,n])=>`<b style="color:var(--ink)">${esc(m)}</b> (${n})`).join(", "):"Your top reasons show up here after a few logs."}</div>`;
 const list=[...X.sessions].sort((a,b)=>b.start-a.start).slice(0,40),urges=[...X.urges].sort((a,b)=>b.ts-a.ts).slice(0,10);
 const rows=[...list.map(s=>({ts:s.start,html:`<button class="tr" data-sid="${s.id}"><span class="res l" style="background:rgba(183,163,224,.16);color:#CBBDF0">${s.puffs} PUFF${s.puffs===1?"":"S"}</span><span class="ti"><div>${esc((s.moods||[]).join(", ")||"No reason picked")}</div><small>${whenStr(s.start)} · ${mmss(((s.end||s.start)-s.start)/1000)}${s.notes?" · "+esc(s.notes.slice(0,60)):""}</small></span><span class="pen" aria-hidden="true">✎</span></button>`})),
  ...urges.map(u=>({ts:u.ts,html:`<div class="tr"><span class="res ${u.outcome==="passed"?"w":"o"}">${u.outcome==="passed"?"BEAT IT":"URGE"}</span><span class="ti"><div>${u.outcome==="passed"?"Rode out the urge":"Urge, smoked after"}${(u.moods||[]).length?" · "+esc(u.moods.join(", ")):""}</div><small>${whenStr(u.ts)} · calm mode ${mmss(u.secs||0)}</small></span></div>`}))].sort((a,b)=>b.ts-a.ts);
 $("smokelog").innerHTML=`<div class="row sb"><span class="ptitle">History</span><span class="sub">Tap a session to edit it</span></div>${rows.length?rows.map(r=>r.html).join(""):`<div class="empty"><b>No logs yet</b>Start a session when you smoke, or tap the button above when an urge hits.</div>`}`;
 $("smokelog").querySelectorAll("[data-sid]").forEach(b=>b.onclick=()=>editSmoke(b.dataset.sid))}
function startSmoke(limit,moods=[]){const X=SM();if(X.active)return;X.active={start:Date.now(),puffs:0,moods:[...moods],notes:"",limit:+limit||0};save();renderSmoke();toast("Session started");
 if(X.active.limit){clearTimeout(smokeLimitT);smokeLimitT=setTimeout(()=>{if(SM().active){try{navigator.vibrate&&navigator.vibrate([300,150,300])}catch(e){}toast(`${limit} minutes are up`)}},limit*60000);
  if(LN)LN.schedule({notifications:[{id:SMOKE_NOTIF_ID,title:`⏱ ${limit} minutes are up`,body:"End your session in Daily HQ when you're done.",channelId:"tasks",smallIcon:"ic_stat_dailyhq",iconColor:"#EFBC90",extra:{kind:"smoke"},schedule:{at:new Date(Date.now()+limit*60000),allowWhileIdle:true}}]}).catch(()=>{})}}
function endSmoke(){const X=SM(),a=X.active;if(!a)return;clearTimeout(smokeLimitT);if(LN)LN.cancel({notifications:[{id:SMOKE_NOTIF_ID}]}).catch(()=>{});
 X.sessions.push({id:uid(),start:a.start,end:Date.now(),puffs:a.puffs,moods:a.moods,notes:(a.notes||"").trim()});X.active=null;save();renderSmoke();toast(`Logged · ${a.puffs} puff${a.puffs===1?"":"s"}`)}
function editSmoke(id){const X=SM(),isNew=!id,s=isNew?{id:uid(),start:Date.now()-10*60000,end:Date.now()-5*60000,puffs:3,moods:[],notes:""}:X.sessions.find(x=>x.id===id);if(!s)return;const moods=[...(s.moods||[])];
 openSheet(`<h2>${isNew?"Log a session":"Edit session"}</h2><div class="pair"><div class="field"><label for="se-t">When</label><input id="se-t" type="datetime-local" value="${toLocalInput(s.start)}"></div><div class="field"><label for="se-p">Puffs</label><input id="se-p" type="number" inputmode="numeric" value="${s.puffs}"></div></div>
 <div class="field"><label for="se-m">Length (minutes)</label><input id="se-m" type="number" inputmode="decimal" value="${Math.max(0,Math.round(((s.end||s.start)-s.start)/60000))}"></div>
 <div class="field"><label>Why</label>${chipPicker(moods,MOODS_SMOKE)}</div><div class="field"><label for="se-n">Notes</label><textarea id="se-n" style="min-height:70px">${esc(s.notes||"")}</textarea></div>
 <div class="btns"><button class="action p" id="se-save">${isNew?"Add":"Save"}</button>${isNew?"":`<button class="action danger" id="se-del">Delete</button>`}</div>`,root=>{bindChips(root,moods);
  root.querySelector("#se-save").onclick=()=>{const st=new Date(root.querySelector("#se-t").value).getTime()||s.start;Object.assign(s,{start:st,end:st+(+root.querySelector("#se-m").value||0)*60000,puffs:Math.max(0,Math.round(+root.querySelector("#se-p").value||0)),moods,notes:root.querySelector("#se-n").value.trim()});if(isNew)X.sessions.push(s);save();closeSheet();renderSmoke();toast(isNew?"Logged":"Saved")};
  const d=root.querySelector("#se-del");if(d)d.onclick=()=>{if(!d.dataset.sure){d.dataset.sure=1;d.textContent="Tap again to delete";return}X.sessions=X.sessions.filter(x=>x.id!==s.id);save();closeSheet();renderSmoke();toast("Deleted")}})}

/* ================= calm mode ================= */
const CALM_TIPS=[
 ["The wave passes","Cravings rise, peak and fade, usually within a few minutes. You don't have to fight it. Just outlast it."],
 ["Physiological sigh","Two quick inhales through the nose, then one long, slow exhale through the mouth. It's one of the fastest ways to settle your body."],
 ["Long exhales calm you","Breathing out for longer than you breathe in slows your heart rate and nudges your nervous system toward calm."],
 ["Cold water reset","Splash cold water on your face or hold something cold for 30 seconds. It triggers a reflex that slows your heart rate."],
 ["Delay, don't decide","You don't have to decide forever. Just decide not right now. Set ten minutes and check in with yourself after."],
 ["5-4-3-2-1","Name 5 things you can see, 4 you can feel, 3 you can hear, 2 you can smell, and 1 you can taste."],
 ["Check HALT","Are you Hungry, Angry, Lonely or Tired? Fix the real need: eat, vent, text someone, or rest."],
 ["Move for two minutes","Walk, do 10 push-ups or 20 squats. Movement burns off the restless energy behind an urge."],
 ["Change the scene","Leave the spot where you usually smoke. Cravings are strongly tied to places and routines."],
 ["Keep your hands busy","Hold a pen, a stress ball or your phone. Your hands are part of the habit too."],
 ["Drink a full glass of water","Sip it slowly. It gives your mouth and hands something to do, and it counts toward your 4 L."],
 ["Urge surfing","Notice where you feel the urge in your body. Describe it like a scientist. Watching it makes it smaller."],
 ["Boredom is a signal","If boredom is the trigger, swap in something quick: a song, a stretch, a message to a friend."],
 ["Stress is real, smoke is borrowed calm","The relief is short. Breathing gives you the same calm without the comeback craving."],
 ["Every urge you beat counts","Each one you ride out makes the next one weaker. That's how the habit loosens."],
 ["Be kind to yourself","If you smoke anyway, log it and move on. Data, not guilt. Tomorrow is a fresh streak."],
 ["Want backup?","For nicotine, free coaching is available at 1-800-QUIT-NOW (US). Talking it through helps."]];
const BREATHS={sigh:{name:"Calming sigh",steps:[["Breathe in",2,1.08],["Sip in more",1,1.25],["Long breath out",6,.62]]},box:{name:"Box 4-4-4-4",steps:[["Breathe in",4,1.25],["Hold",4,1.25],["Breathe out",4,.62],["Hold",4,.62]]},b478:{name:"4-7-8",steps:[["Breathe in",4,1.25],["Hold",7,1.25],["Breathe out slowly",8,.62]]}};
let calm=null;
function openCalm(){const el=$("calm");el.hidden=false;document.body.style.overflow="hidden";calm={start:Date.now(),pattern:S.ui.breath||"sigh",tip:Math.floor(Math.random()*CALM_TIPS.length),moods:[],raf:0,timers:[]};
 try{navigator.wakeLock&&navigator.wakeLock.request("screen").then(l=>calm&&(calm.lock=l)).catch(()=>{})}catch(e){}
 $("calmin").innerHTML=`<div class="calm-top"><span class="eyebrow" style="color:#DCE7F2">Urge timer</span><div class="calm-clock" id="cclock">0:00</div><button class="calm-x" id="cx" aria-label="Close calm mode">✕</button></div>
 <div class="breath"><div class="orb" id="orb"><div class="orb-in"><b id="bphase">Get comfortable</b><span id="bcount"></span></div></div>
  <div class="chips breathpick">${Object.entries(BREATHS).map(([k,b])=>`<button class="chip ${k===calm.pattern?"on":""}" data-b="${k}">${b.name}</button>`).join("")}</div></div>
 <div class="tipcard" id="tipcard"><div class="row sb"><span class="tiplabel">TIP <span id="tipn"></span></span><div class="row"><button class="tipnav" id="tprev" aria-label="Previous tip">‹</button><button class="tipnav" id="tnext" aria-label="Next tip">›</button></div></div><h3 id="tiph"></h3><p id="tipb"></p></div>
 <div class="calm-moods"><span>What's driving it?</span>${chipPicker([],MOODS_SMOKE)}</div>
 <div class="calm-actions"><button class="action p big-btn" id="cpass">The urge passed 💪</button><button class="action" id="csmoked">I smoked anyway</button></div>`;
 bindChips($("calmin"),calm.moods);
 $("calmin").querySelectorAll(".breathpick .chip").forEach(b=>b.onclick=()=>{calm.pattern=S.ui.breath=b.dataset.b;save();$("calmin").querySelectorAll(".breathpick .chip").forEach(x=>x.classList.toggle("on",x===b));runBreath()});
 const showTip=d=>{calm.tip=(calm.tip+d+CALM_TIPS.length)%CALM_TIPS.length;const [h,p]=CALM_TIPS[calm.tip],c=$("tipcard");$("tipn").textContent=`${calm.tip+1}/${CALM_TIPS.length}`;$("tiph").textContent=h;$("tipb").textContent=p;c.classList.remove("swap");void c.offsetWidth;c.classList.add("swap")};
 showTip(0);$("tprev").onclick=()=>{showTip(-1);resetTipTimer()};$("tnext").onclick=()=>{showTip(1);resetTipTimer()};
 let tx=0;$("tipcard").addEventListener("touchstart",e=>tx=e.touches[0].clientX,{passive:true});$("tipcard").addEventListener("touchend",e=>{const d=e.changedTouches[0].clientX-tx;if(Math.abs(d)>40){showTip(d<0?1:-1);resetTipTimer()}});
 const resetTipTimer=()=>{clearInterval(calm.tipT);calm.tipT=setInterval(()=>showTip(1),14000)};resetTipTimer();
 calm.clockT=setInterval(()=>{const c=$("cclock");if(c)c.textContent=mmss((Date.now()-calm.start)/1000)},1000);
 $("cx").onclick=()=>closeCalm(null);$("cpass").onclick=()=>closeCalm("passed");$("csmoked").onclick=()=>closeCalm("smoked");
 runBreath();drawCalm()}
function runBreath(){if(!calm)return;calm.timers.forEach(clearTimeout);calm.timers=[];const P=BREATHS[calm.pattern],orb=$("orb");let i=0;
 const step=()=>{if(!calm)return;const [label,secs,scale]=P.steps[i%P.steps.length];$("bphase").textContent=label;orb.style.transition=`transform ${secs}s ease-in-out`;orb.style.transform=`scale(${scale})`;
  let n=secs;$("bcount").textContent=n;const tick=()=>{n--;if(n>0&&calm){$("bcount").textContent=n;calm.timers.push(setTimeout(tick,1000))}};calm.timers.push(setTimeout(tick,1000));
  if(/in/i.test(label)&&!/out/i.test(label))try{navigator.vibrate&&navigator.vibrate(20)}catch(e){}
  i++;calm.timers.push(setTimeout(step,secs*1000))};
 calm.timers.push(setTimeout(step,600))}
function drawCalm(){const cv=$("calmcv"),c=cv.getContext("2d");const fit=()=>{cv.width=innerWidth*Math.min(2,devicePixelRatio||1)/2;cv.height=innerHeight*Math.min(2,devicePixelRatio||1)/2};fit();calm.fit=fit;addEventListener("resize",fit);
 const blobs=[["#2E6F7A",.2,.25,.55],["#6C5CA8",.8,.3,.5],["#E7A77E",.5,.85,.45],["#3E8C77",.15,.8,.4],["#4A5FA8",.85,.75,.45]];
 if(RM){cv.style.display="none";return}cv.style.display="";
 const frame=t=>{if(!calm)return;const W=cv.width,H=cv.height,R=Math.max(W,H);c.fillStyle="#0B1D2A";c.fillRect(0,0,W,H);c.globalCompositeOperation="lighter";
  blobs.forEach(([col,x,y,r],i)=>{const s=RM?0:t/1000,px=(x+Math.sin(s*.07+i*1.7)*.18)*W,py=(y+Math.cos(s*.05+i*2.3)*.16)*H,rr=R*r*(1+Math.sin(s*.11+i)*.12);const g=c.createRadialGradient(px,py,0,px,py,rr);g.addColorStop(0,col+"70");g.addColorStop(1,col+"00");c.fillStyle=g;c.fillRect(0,0,W,H)});
  c.globalCompositeOperation="source-over";if(!RM)calm.raf=requestAnimationFrame(frame)};calm.raf=requestAnimationFrame(frame)}
function closeCalm(outcome){if(!calm)return;const secs=Math.round((Date.now()-calm.start)/1000),moods=calm.moods;cancelAnimationFrame(calm.raf);calm.timers.forEach(clearTimeout);clearInterval(calm.tipT);clearInterval(calm.clockT);removeEventListener("resize",calm.fit);try{calm.lock&&calm.lock.release()}catch(e){}
 calm=null;$("calm").hidden=true;document.body.style.overflow="";
 if(outcome){SM().urges.push({ts:Date.now(),outcome,secs,moods});if(outcome==="passed"){addXP(15);save();if(S.view!=="smoke")go("smoke");else renderSmoke();toast(`Urge beaten in ${mmss(secs)} · +15 XP`);burst($("calmbtn"),["#B7A3E0","#86D3B0","#EFBC90","#9FD4F7"])}
  else{save();go("smoke");startSmoke(S.ui.smokeLimit??5,moods);toast("No judgment. Logging it helps you spot patterns.")}}}
$("calmbtn").onclick=()=>openCalm();

/* ================= dogs ================= */
const dogLog=(k,id)=>(S.dogs.log[k]||{})[id];
function dogStatus(d){const keys=Object.keys(S.dogs.log).filter(k=>dogLog(k,d.id)&&dogLog(k,d.id).stool).sort().reverse();
 let streak=0;for(const k of keys){const s=dogLog(k,d.id).stool;if(s===2||s===3)streak++;else break}
 const fresh=d.sensitive?(streak<2?10:streak<4?20:25):(streak<2?20:25),eggs=streak>=2;
 const today=dkey(),y=new Date();y.setDate(y.getDate()-1);const yk=dkey(y),t=dogLog(today,d.id),yy=dogLog(yk,d.id);const urgent=[],watch=[];
 if(t){if(t.food===0)urgent.push("Ate nothing today");if(t.water==="low")watch.push("Drinking less than usual");if(t.urine==="dark")watch.push("Dark urine: keep fresh water out. Orange, red or brown urine is a vet call");if(t.energy===1)urgent.push("Very low energy");
  if(t.stool===5&&yy&&yy.stool===5)urgent.push("Watery diarrhea two days running");else if(t.stool===5)watch.push("Watery stool today: fresh food drops back to the starting amount until stool is normal again")}
 return{streak,fresh,eggs,urgent,watch,today:t,logged:!!t,history:[...Array(7)].map((_,i)=>{const x=new Date();x.setDate(x.getDate()-6+i);const l=dogLog(dkey(x),d.id);return l&&l.stool||0})}}
function dogCurrentWeight(d){const e=Object.entries(d.wlog||{}).sort((a,b)=>a[0]<b[0]?-1:1);return e.length?e[e.length-1][1]:parseFloat(d.weight)}
function dogPortions(d,fresh){const lb=dogCurrentWeight(d);if(!(lb>0))return null;const lose=d.goal==="lose"&&+d.target>0&&+d.target<lb;
 const kg=(lose?+d.target:lb)/2.2046,mer=70*Math.pow(kg,.75)*(lose?1.0:(+d.factor||1.4)),fk=mer*fresh/100,kk=mer-fk,kc=+S.dogs.kibbleKcal||350;
 return{mer,lose,freshKcal:fk,freshG:fk/FRESH_KCAL_G,freshCup:fk/FRESH_KCAL_CUP,kibCup:kk/kc}}
function dogWeightLine(d){if(d.goal!=="lose"||!(+d.target>0))return"";const e=Object.entries(d.wlog||{}).sort((a,b)=>a[0]<b[0]?-1:1),start=e.length?e[0][1]:parseFloat(d.weight),cur=dogCurrentWeight(d),lost=start-cur,toGo=cur-+d.target;
 let pace="";if(e.length>=2){const days=Math.max(1,daysBetween(e[0][0],e[e.length-1][0])),wk=lost/days*7;pace=wk<0.4?" Slower than planned: trim treats and keep fresh food to green-bean-heavy portions.":wk>1.2?" Faster than planned: add a little food back.":" Right on pace."}
 return `<div class="goal"><b>Weight-loss goal: ${esc(String(d.target))} lb</b><span>${cur.toFixed(1)} lb now · ${lost>0?lost.toFixed(1)+" lb lost · ":""}${toGo>0?toGo.toFixed(1)+" lb to go":"Goal reached"}. Aim for 0.5–1 lb a week.${pace}</span></div>`}
const r5=x=>Math.round(x/5)*5,cupStr=c=>{const q=Math.round(c*8)/8,w=Math.floor(q),f=q-w,fr={0:"",0.125:"⅛",0.25:"¼",0.375:"⅜",0.5:"½",0.625:"⅝",0.75:"¾",0.875:"⅞"}[f];return (w?w+(fr?" ":""):"")+(fr||(w?"":"0"))+" cup"+(q>1?"s":"")};
function batchDays(){const tot=S.dogs.list.reduce((s,d)=>{const p=dogPortions(d,dogStatus(d).fresh);return s+(p?p.freshKcal:0)},0);return tot?BATCH_KCAL/tot:null}
function dogDashboard(){const D=S.dogs;return `<div class="grid dogs">${D.list.map(d=>{const s=dogStatus(d);return `<div class="panel dogcard ${s.urgent.length?"alert":""}">
  <div class="row sb"><div><span class="eyebrow">${dogCurrentWeight(d)>0?dogCurrentWeight(d)+" lb":"Weight not set"}${d.sensitive?" · settling stomach":""}${d.goal==="lose"?" · losing weight":""}</span><div class="h1" style="font-size:26px;margin:4px 0">${esc(d.name)}</div></div><span class="chip ${s.logged?"up":""}">${s.logged?"✓ Checked in":"Not checked in"}</span></div>
  <div class="ratio"><i style="width:${100-s.fresh}%"></i><b style="width:${s.fresh}%"></b></div>
  <div class="sub"><b style="color:var(--ink)">Today: ${100-s.fresh}% kibble + ${s.fresh}% fresh.</b> ${s.streak?`${s.streak} normal-stool day${s.streak>1?"s":""} in a row.`:"Step up once stool stays normal."}${s.fresh<25?" Next step after "+(d.sensitive?(s.streak<2?2:4):2)+" normal days.":" Holding at the 25% maximum."}</div>
  ${(()=>{const p=dogPortions(d,s.fresh);return (p?dogWeightLine(d):"")+(p?`<div class="portion"><div><small>${p.lose?"Weight-loss portions · per meal":"Per meal (AM and PM)"}</small><b>${cupStr(p.kibCup/2)} kibble</b><b>+ ${r5(p.freshG/2)} g fresh <span>(≈ ${cupStr(p.freshCup/2)})</span></b></div><div><small>Per day</small><b>${Math.round(p.mer)} kcal</b><span>${r5(p.freshG)} g fresh</span></div></div>`:`<div class="sub" style="margin-top:6px">Add ${esc(d.name)}'s weight to see portions.</div>`)})()}
  <div class="sub" style="margin-top:6px">Eggs: ${s.eggs?"<span class='up'>OK to add (2–4 per dog per week)</span>":"not yet (wait for 48 hours of normal stool)"}</div>
  <div class="stools" title="Stool, last 7 days">${s.history.map(v=>`<i class="s${v}"></i>`).join("")}<small>stool, last 7 days</small></div>
  ${s.urgent.map(x=>`<div class="flag urgent">⚠ ${esc(x)}. Call your vet.</div>`).join("")}${s.watch.map(x=>`<div class="flag">${esc(x)}</div>`).join("")}</div>`}).join("")}
  <div class="panel freezer"><span class="eyebrow">Freezer bags</span><div class="big" style="font-size:44px">${D.freezer||0}</div><div class="sub">${D.freezer?"bags left":"Cook a batch on meal-prep day"}</div>
  ${(()=>{const bd=batchDays();if(!bd)return"";const perDay=D.list.reduce((s,d)=>{const p=dogPortions(d,dogStatus(d).fresh);return s+(p?p.freshG:0)},0);return `<div class="sub" style="margin-top:6px">One batch (~${(BATCH_G/1000).toFixed(1)} kg) lasts about <b style="color:var(--ink)">${Math.floor(bd)} days</b> at today's ratios. One bag a day for both dogs ≈ ${r5(perDay)} g.</div>`})()}
  <div class="row" style="margin-top:12px"><button class="action" id="fz-minus" aria-label="Use one bag">−1</button><button class="action" id="fz-plus" aria-label="Add one bag">+1</button><button class="action" id="fz-batch">+ Add batch</button></div></div></div>
 <div class="row" style="margin:2px 0 14px"><button class="action p" id="dogcheck">Daily check-in</button><button class="action" id="dogrecipe">Meal-prep recipe</button><button class="action" id="dogedit">Names and weights</button></div>
 <details class="panel safe redflags"><summary>Red flags</summary><div style="margin-top:10px">${esc(DOG_FLAGS)}</div></details>`}
function bindDogDashboard(){const D=S.dogs,upd=n=>{D.freezer=Math.max(0,(D.freezer||0)+n);save();renderFood()};
 $("fz-minus").onclick=()=>upd(-1);$("fz-plus").onclick=()=>upd(1);
 $("fz-batch").onclick=()=>openSheet(`<h2>Add a batch</h2><p class="desc">How many bags went into the freezer?</p><div class="field"><label for="fz-n">Bags</label><input id="fz-n" type="number" inputmode="numeric" value="7"></div><div class="btns"><button class="action p" id="fz-save">Add bags</button></div>`,root=>{root.querySelector("#fz-save").onclick=()=>{const n=Math.round(+root.querySelector("#fz-n").value);if(!(n>0)){toast("Enter how many bags");return}closeSheet();upd(n);toast(n+" bags added to the freezer")}});
 $("dogcheck").onclick=()=>dogCheckIn();$("dogrecipe").onclick=()=>{const r=S.food.recipes.find(x=>x.name===HUSKY_RECIPE.name);if(r)openRecipe(r.id)};$("dogedit").onclick=()=>dogEdit()}
function dogCheckIn(){const k=dkey(),D=S.dogs;
 openSheet(`<h2>Dog check-in</h2><p class="desc">${new Date().toLocaleDateString([], {weekday:"long",month:"long",day:"numeric"})}. Takes about 20 seconds.</p>
 ${D.list.map(d=>{const l=dogLog(k,d.id)||{};const o=(n,list,v)=>opts(d.id+"-"+n,list,v===undefined?"":String(v));return `<div class="sec" style="margin-top:10px"><h3>${esc(d.name)}</h3>
  <div class="field"><label>Food eaten</label>${o("food",[0,25,50,75,100].map(x=>[String(x),x+"%"]),l.food)}</div>
  <div class="field"><label>Water</label>${o("water",[["low","Low"],["normal","Normal"],["high","High"]],l.water)}</div>
  <div class="field"><label>Stool</label>${o("stool",[1,2,3,4,5].map(x=>[String(x),String(x)]),l.stool)}<span class="hint">1 very hard · 2 firm · 3 normal · 4 soft · 5 watery</span></div>
  <div class="field"><label>Urine</label>${o("urine",[["yellow","Yellow"],["dark","Dark"]],l.urine)}</div>
  <div class="field"><label>Energy</label>${o("energy",[1,2,3,4,5].map(x=>[String(x),String(x)]),l.energy)}<span class="hint">1 very low · 5 full energy</span></div>
  <div class="field"><label for="${d.id}-note">Note</label><input id="${d.id}-note" value="${esc(l.note||"")}" placeholder="Anything unusual"></div></div>`}).join("")}
 <div class="btns"><button class="action p" id="dc-save">Save check-in</button></div>`,
 root=>{bindOpts(root);root.querySelector("#dc-save").onclick=()=>{S.dogs.log[k]=S.dogs.log[k]||{};let any=false;
   for(const d of D.list){const g=n=>optVal(root,d.id+"-"+n),num=n=>g(n)===undefined||g(n)===""?undefined:+g(n);const e={food:num("food"),water:g("water"),stool:num("stool"),urine:g("urine"),energy:num("energy"),note:root.querySelector("#"+d.id+"-note").value.trim()};
    if(Object.values(e).some(v=>v!==undefined&&v!=="")){S.dogs.log[k][d.id]=e;any=true}}
   if(!any){toast("Tap at least one answer");return}const t=S.routine.find(r=>r.link==="dogs"),dd=dayData(k),both=D.list.every(d=>dogLog(k,d.id));save();closeSheet();
   if(t&&both&&!dd.done[t.id])toggleTask(t.id);else toast("Check-in saved");renderFood();
   const urgent=D.list.flatMap(d=>dogStatus(d).urgent.map(x=>d.name+": "+x));if(urgent.length)setTimeout(()=>toast("⚠ "+urgent[0]+". Call your vet."),900)}})}
function dogEdit(){const D=S.dogs;openSheet(`<h2>Names and weights</h2><p class="desc">Weights let us work out exact grams per meal later.</p>
 ${D.list.map(d=>`<div class="pair"><div class="field"><label for="dn-${d.id}">Name</label><input id="dn-${d.id}" value="${esc(d.name)}"></div><div class="field"><label for="dw-${d.id}">Weight (lb)</label><input id="dw-${d.id}" type="number" inputmode="decimal" value="${esc(d.weight)}" placeholder="55"></div></div>
 <div class="field"><label>${esc(d.name)}'s goal</label>${opts("goal-"+d.id,[["maintain","Stay at this weight"],["lose","Lose weight"]],d.goal||"maintain")}</div>
 <div class="pair"><div class="field"><label for="dt-${d.id}">Goal weight (lb)</label><input id="dt-${d.id}" type="number" inputmode="decimal" value="${esc(d.target||"")}" placeholder="${Math.round((parseFloat(d.weight)||50)*0.9*2)/2}"></div><div class="field"><label for="dl-${d.id}">Weigh-in today (lb)</label><input id="dl-${d.id}" type="number" inputmode="decimal" step="0.1" value="${esc((d.wlog||{})[dkey()]||"")}" placeholder="optional"></div></div>
 <div class="field"><label>${esc(d.name)}'s activity</label>${opts("act-"+d.id,ACTIVITY,String(d.factor||1.4))}</div>
 <div class="field"><label><input type="checkbox" id="ds-${d.id}" ${d.sensitive?"checked":""} style="width:auto;margin-right:8px">${esc(d.name)} has a sensitive stomach right now (start at 10% fresh)</label></div>`).join("")}
 <div class="field"><label for="kk">Kibble calories per cup</label><input id="kk" type="number" inputmode="numeric" value="${esc(D.kibbleKcal||350)}"><span class="hint">Printed on the Diamond Naturals bag as "kcal/cup". Most formulas are 330–390.</span></div>
 <p class="desc" style="margin-top:12px">Portions are estimates from body weight. Weigh the dogs every few weeks and adjust if they gain or lose. Your vet has the final say.</p>
 <div class="btns"><button class="action p" id="de-save">Save</button></div>`,root=>{bindOpts(root);root.querySelector("#de-save").onclick=()=>{for(const d of D.list){d.name=root.querySelector("#dn-"+d.id).value.trim()||d.name;d.weight=root.querySelector("#dw-"+d.id).value.trim();d.sensitive=root.querySelector("#ds-"+d.id).checked;d.factor=+optVal(root,"act-"+d.id)||1.4;
   d.goal=optVal(root,"goal-"+d.id)||"maintain";const tg=+root.querySelector("#dt-"+d.id).value;d.target=tg>0?tg:(d.goal==="lose"?Math.round((parseFloat(d.weight)||0)*0.9*2)/2:"");
   const wi=+root.querySelector("#dl-"+d.id).value;if(wi>5&&wi<250){d.wlog=d.wlog||{};d.wlog[dkey()]=Math.round(wi*10)/10}}
  const wt=S.routine.find(r=>r.link==="dogweigh");if(wt&&D.list.some(d=>(d.wlog||{})[dkey()])&&!dayData(dkey()).done[wt.id])toggleTask(wt.id);
  const kk=+root.querySelector("#kk").value;if(kk>150&&kk<700)D.kibbleKcal=kk;save();closeSheet();renderFood();toast("Saved")}})}

/* ================= water ================= */
const W=()=>S.water;
const waterLog=(k=dkey())=>W().log[k]||[];
const waterToday=(k=dkey())=>waterLog(k).reduce((s,e)=>s+e.ml,0);
const fmtL=ml=>(ml/1000).toFixed(ml%1000===0?0:ml%100===0?1:2)+" L";
function waterPace(){const now=new Date(),m=now.getHours()*60+now.getMinutes(),a=tmin(W().start),b=tmin(W().end);const f=Math.max(0,Math.min(1,(m-a)/Math.max(1,b-a)));
 const expected=Math.round(W().goal*f/50)*50,drunk=waterToday();return{expected,drunk,behind:Math.max(0,expected-drunk),f}}
function waterTask(){return S.routine.find(r=>r.link==="water")}
function addWater(ml,el){if(!(ml>0))return;const k=dkey();(W().log[k]=W().log[k]||[]).push({ts:Date.now(),ml:Math.round(ml)});afterWater(true,el);
 toast(`+${ml} ml · ${fmtL(waterToday())} of ${fmtL(W().goal)}`,"Undo",()=>{const l=W().log[k];if(l&&l.length){l.pop();afterWater(false)}})}
function afterWater(added,el){const k=dkey(),t=waterTask(),dd=dayData(k),hit=waterToday(k)>=W().goal;
 if(t){if(hit&&!dd.done[t.id]){toggleTask(t.id,el);if(added)setTimeout(()=>{toast("Water goal reached. "+fmtL(W().goal)+" today.");burst(el||$("wbig"),["#7AB8F0","#A9D5F5","#EFBC90"])},250)}else if(!hit&&dd.done[t.id])toggleTask(t.id)}
 save();renderWater();if(!$("sheetwrap").hidden&&$("sheet").dataset.kind==="water")drawWaterSheet($("sheet"))}
function renderWater(){const p=waterPace(),g=W().goal,pct=Math.min(100,Math.round(p.drunk/g*100));
 const lbl=$("waterlbl");if(lbl)lbl.textContent=fmtL(p.drunk)+" / "+fmtL(g);const dot=$("waterdot");if(dot)dot.hidden=!(p.behind>=500&&p.drunk<g);
 const c=$("watercard");if(!c)return;
 c.innerHTML=`<div class="row sb"><div><span class="eyebrow">Water</span><div class="wnum" id="wbig">${fmtL(p.drunk)} <span>/ ${fmtL(g)}</span></div></div><div class="row"><button class="action" id="wdetail">Log or remind</button><button class="action wbtn" id="wadd">+${W().step} ml</button></div></div>
 <div class="wbar"><i style="width:${pct}%"></i><b style="left:${Math.round(p.f*100)}%" title="Where you should be by now"></b></div>
 <div class="sub" style="margin-top:8px">${p.drunk>=g?"Goal reached. Nice work.":p.behind>=500?`You're ${fmtL(p.behind)} behind pace. Have a glass now.`:`On pace. ${fmtL(Math.max(0,g-p.drunk))} to go.`}</div>`;
 $("wadd").onclick=e=>addWater(W().step,e.currentTarget);$("wdetail").onclick=()=>openWater()}
function openWater(){$("sheet").dataset.kind="water";$("sheetwrap").hidden=false;drawWaterSheet($("sheet"))}
function drawWaterSheet(root){const k=dkey(),p=waterPace(),g=W().goal,log=waterLog(k);
 const days=[...Array(7)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);const kk=dkey(d);return[d.toLocaleDateString([], {weekday:"narrow"}),waterToday(kk)]});
 const notifOK=typeof Notification!=="undefined";
 root.innerHTML=`<div class="grab"></div><h2>Water</h2><p class="desc">${fmtL(p.drunk)} of ${fmtL(g)} today · ${p.drunk>=g?"goal reached":p.behind>=500?fmtL(p.behind)+" behind pace":"on pace"}</p>
 <div class="wbar big"><i style="width:${Math.min(100,p.drunk/g*100)}%"></i><b style="left:${Math.round(p.f*100)}%"></b></div>
 <div class="btns"><button class="action wbtn" id="ws-add" style="min-height:58px;font-size:16px">+${W().step} ml</button><button class="action" id="ws-250">+250 ml</button></div>
 <div class="add"><input id="ws-ml" type="number" inputmode="numeric" placeholder="Custom amount in ml" aria-label="Custom amount in ml"><button class="action p" id="ws-log">Log</button></div>
 <h3 class="rh">Today</h3>${log.length?`<div class="steps">${log.map((e,i)=>`<div class="step"><span class="ck">💧</span><span>${e.ml} ml · ${timeStr(e.ts)}</span><button class="link" data-del="${i}" aria-label="Remove" style="margin-left:auto">✕</button></div>`).join("")}</div>`:`<p class="sub">Nothing logged yet today.</p>`}
 <h3 class="rh">Last 7 days</h3><div class="wweek">${days.map(([d,ml])=>`<div><i style="height:${Math.min(100,ml/g*100)}%" class="${ml>=g?"full":""}"></i><small>${d}</small></div>`).join("")}</div>
 <h3 class="rh">Reminders</h3><p class="desc">Remind me from <b>${esc(W().start)}</b> to <b>${esc(W().end)}</b>, every <b>${W().every} min</b>. That's about ${Math.max(1,Math.floor((tmin(W().end)-tmin(W().start))/W().every)+1)} reminders a day.</p>
 <div class="pair"><div class="field"><label for="ws-s">From</label><input id="ws-s" value="${esc(W().start)}"></div><div class="field"><label for="ws-e">Until</label><input id="ws-e" value="${esc(W().end)}"></div></div>
 <div class="field"><label>Every</label>${opts("every",[["60","60 min"],["90","90 min"],["120","2 hours"]],String(W().every))}</div>
 <div class="pair"><div class="field"><label for="ws-goal">Daily goal (L)</label><input id="ws-goal" type="number" step="0.25" inputmode="decimal" value="${g/1000}"></div><div class="field"><label for="ws-step">Quick button (ml)</label><input id="ws-step" type="number" step="50" inputmode="numeric" value="${W().step}"></div></div>
 <div class="btns"><button class="action p" id="ws-save">Save settings</button></div>
 <div class="note" style="margin-top:14px"><b>Phone reminders (recommended).</b> Adds repeating reminders to your phone's calendar. They go off even when Daily HQ is closed.</div>
 <div class="btns" style="margin-top:0"><button class="action" id="ws-cal">Add reminders to my calendar</button></div>
 ${notifOK?`<div class="btns"><button class="action" id="ws-notif">${W().notify&&Notification.permission==="granted"?"App notifications: on · turn off":"Turn on app notifications"}</button></div><p class="desc" style="margin-top:6px">App notifications only arrive while Daily HQ is running in the background. They include a Log ${W().step} ml button.</p>`:""}`;
 bindOpts(root);
 root.querySelector("#ws-add").onclick=e=>addWater(W().step,e.currentTarget);root.querySelector("#ws-250").onclick=e=>addWater(250,e.currentTarget);
 root.querySelector("#ws-log").onclick=()=>{const v=+root.querySelector("#ws-ml").value;if(!(v>0&&v<=3000)){toast("Enter an amount between 1 and 3000 ml");return}addWater(v)};
 root.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{W().log[k].splice(+b.dataset.del,1);afterWater(false)});
 root.querySelector("#ws-save").onclick=()=>{const s=root.querySelector("#ws-s").value.trim(),e=root.querySelector("#ws-e").value.trim();if(tmin(s)>=9998||tmin(e)>=9998||tmin(e)<=tmin(s)){toast("Use times like 7:00 AM and 9:00 PM");return}
  const goal=Math.round((+root.querySelector("#ws-goal").value||4)*1000),step=Math.round(+root.querySelector("#ws-step").value||500);Object.assign(W(),{start:s,end:e,every:+optVal(root,"every"),goal:Math.max(500,goal),step:Math.max(50,step)});
  const t=waterTask();if(t)t.t="Drink "+fmtL(W().goal)+" of water";save();renderToday();afterWater(false);toast("Water settings saved")};
 root.querySelector("#ws-cal").onclick=()=>calendarReminders();
 const nb=root.querySelector("#ws-notif");if(nb)nb.onclick=async()=>{if(W().notify&&Notification.permission==="granted"){W().notify=false;save();drawWaterSheet(root);toast("App notifications off");return}
  const r=await Notification.requestPermission();if(r==="granted"){W().notify=true;W().lastNotify=Date.now();save();toast("App notifications on")}else toast("Notifications are blocked. Allow them for this app in Android settings.");drawWaterSheet(root)}}
function calendarReminders(){const a=tmin(W().start),b=tmin(W().end),ev=W().every,d=dkey().replace(/-/g,""),stamp=new Date().toISOString().replace(/[-:]/g,"").slice(0,15)+"Z";
 const lines=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Daily HQ//Water//EN","CALSCALE:GREGORIAN"];let n=0;
 for(let m=a;m<=b;m+=ev){const hh=String(Math.floor(m/60)).padStart(2,"0"),mm=String(m%60).padStart(2,"0");n++;
  lines.push("BEGIN:VEVENT",`UID:dailyhq-water-${hh}${mm}@dailyhq`,`DTSTAMP:${stamp}`,`DTSTART:${d}T${hh}${mm}00`,"DURATION:PT5M","RRULE:FREQ=DAILY",`SUMMARY:💧 Drink water (${W().step} ml)`,`DESCRIPTION:Log it in Daily HQ. Goal ${fmtL(W().goal)} a day.`,"TRANSP:TRANSPARENT","BEGIN:VALARM","ACTION:DISPLAY","DESCRIPTION:Drink water","TRIGGER:PT0M","END:VALARM","END:VEVENT")}
 lines.push("END:VCALENDAR");const file=new File([lines.join("\r\n")],"daily-hq-water-reminders.ics",{type:"text/calendar"});
 const dl=()=>{const u=URL.createObjectURL(file),x=document.createElement("a");x.href=u;x.download=file.name;document.body.appendChild(x);x.click();setTimeout(()=>{URL.revokeObjectURL(u);x.remove()},1500);toast(`${n} daily reminders saved. Open the file and add it to your Calendar.`)};
 if(navigator.canShare&&navigator.canShare({files:[file]}))navigator.share({files:[file],title:"Water reminders"}).then(()=>toast("Pick your Calendar app to add the reminders")).catch(e=>{if(e&&e.name!=="AbortError")dl()});else dl()}
function waterTick(){if(!S.water)return;renderWater();const p=waterPace(),now=Date.now(),m=new Date().getHours()*60+new Date().getMinutes(),inWin=m>=tmin(W().start)&&m<=tmin(W().end);
 if(!inWin||p.drunk>=W().goal)return;const last=(waterLog().slice(-1)[0]||{}).ts||0,gap=W().every*60000;
 if(W().notify&&typeof Notification!=="undefined"&&Notification.permission==="granted"&&now-W().lastNotify>=gap&&now-last>=gap*.75){W().lastNotify=now;save();
  const body=`${fmtL(p.drunk)} of ${fmtL(W().goal)} so far${p.behind>=500?`, ${fmtL(p.behind)} behind pace`:""}.`;
  navigator.serviceWorker&&navigator.serviceWorker.ready.then(r=>r.showNotification("💧 Time for water",{body,tag:"water",renotify:true,icon:"icon-192.png",badge:"icon-192.png",actions:[{action:"log",title:`Log ${W().step} ml`}],data:{step:W().step}})).catch(()=>{})}
 if(!document.hidden&&p.behind>=500&&now-W().lastNudge>45*60000&&now-last>30*60000&&$("sheetwrap").hidden){W().lastNudge=now;save();toast(`💧 ${fmtL(p.behind)} behind on water`,`+${W().step} ml`,()=>addWater(W().step))}}
(function waterFromLink(){const q=new URLSearchParams(location.search),v=+q.get("water");if(v>0&&v<=3000){setTimeout(()=>addWater(v),600);history.replaceState(null,"",location.pathname+location.hash)}})();
navigator.serviceWorker&&navigator.serviceWorker.addEventListener("message",e=>{if(e.data&&e.data.water)addWater(+e.data.water)});

/* ================= settings ================= */
function openSettings(focus){const s=S.settings,hidden=S.trades.poly.filter(t=>t.hidden).length+S.trades.manual.filter(t=>t.hidden).length+S.trades.bob.filter(t=>t.hidden).length;
 openSheet(`<h2>Settings</h2><p class="desc">Everything is saved on this phone. Make a backup now and then.</p>
 <div class="sec" style="margin-top:6px;border-top:0;padding-top:0"><h3>Polymarket sync</h3><p class="desc">Paste your Polymarket wallet address. On Polymarket, open your profile and copy the address that starts with 0x. It only lets this app read your public trades. It can't trade or move money.</p>
  <div class="field"><label for="s-w">Wallet address</label><input id="s-w" value="${esc(s.wallet)}" placeholder="0x…" autocomplete="off" autocapitalize="off" spellcheck="false"><span class="hint" id="s-werr"></span></div>
  <div class="field"><label><input type="checkbox" id="s-btc" ${s.btcOnly?"checked":""} style="width:auto;margin-right:8px">Only track Bitcoin Up or Down markets</label></div></div>
 <div class="sec"><h3>Starting balances</h3><p class="desc">Balance = starting balance + profit and loss from settled trades.</p>
  <div class="pair">${Object.keys(ACCTS).map(a=>`<div class="field"><label for="s-b-${a}">${ACCTS[a]}</label><input id="s-b-${a}" type="number" inputmode="decimal" step="0.01" value="${+s.bank[a]||0}"></div>`).join("")}</div></div>
 <div class="sec"><h3>Quick log defaults</h3><p class="desc">What + Won and + Lost log for each tab. You can edit any trade afterwards.</p>
  ${Object.keys(ACCTS).map(a=>`<div class="pair"><div class="field"><label for="s-s-${a}">${ACCTS[a]} amount ($)</label><input id="s-s-${a}" type="number" inputmode="decimal" step="0.01" value="${+s.stake[a]||0}"></div><div class="field"><label for="s-l-${a}">${ACCTS[a]} market name</label><input id="s-l-${a}" value="${esc(s.label[a])}"></div></div>`).join("")}</div>
 <div class="sec"><h3>Journal</h3><div class="field"><label for="s-b5">Name of your fifth journal section</label><input id="s-b5" value="${esc(s.book5)}"></div></div>
 <div class="btns"><button class="action p" id="s-save">Save settings</button></div>
 <div class="sec"><h3>Backup</h3><p class="desc">Save a backup file, or restore one on a new phone.</p>
  <div class="btns" style="margin-top:8px"><button class="action" id="s-exp">Save backup</button><button class="action" id="s-imp">Restore backup</button></div>
  ${hidden?`<div class="btns"><button class="action" id="s-unhide">Restore ${hidden} hidden trade${hidden>1?"s":""}</button></div>`:""}
  <div class="btns"><button class="action danger" id="s-reset">Erase everything</button></div><div id="s-conf"></div></div>`,
 root=>{if(focus==="wallet")setTimeout(()=>root.querySelector("#s-w").focus(),60);
  root.querySelector("#s-save").onclick=()=>{const w=root.querySelector("#s-w").value.trim();if(w&&!/^0x[a-fA-F0-9]{40}$/.test(w)){root.querySelector("#s-werr").textContent="That doesn't look like a wallet address. It should start with 0x and be 42 characters long.";root.querySelector("#s-werr").style.color="var(--rose)";return}
   const changed=w.toLowerCase()!==s.wallet.toLowerCase(),btcChanged=s.btcOnly!==root.querySelector("#s-btc").checked;s.wallet=w;s.btcOnly=root.querySelector("#s-btc").checked;for(const a in ACCTS){s.bank[a]=+root.querySelector("#s-b-"+a).value||0;s.stake[a]=+root.querySelector("#s-s-"+a).value||0;s.label[a]=root.querySelector("#s-l-"+a).value.trim()||s.label[a]}
   s.book5=root.querySelector("#s-b5").value.trim()||"Gratitude";if(changed||btcChanged)S.trades.poly=S.trades.poly.filter(t=>t.src!=="sync");save();closeSheet();renderAll();toast("Settings saved");if(w&&(changed||btcChanged||!S.sync.last))sync(true)};
  root.querySelector("#s-exp").onclick=exportData;root.querySelector("#s-imp").onclick=()=>$("importfile").click();
  const un=root.querySelector("#s-unhide");if(un)un.onclick=()=>{for(const a in ACCTS)S.trades[a].forEach(t=>delete t.hidden);save();closeSheet();renderAll();toast("Hidden trades restored")};
  const r=root.querySelector("#s-reset");r.onclick=()=>{if(!r.dataset.sure){r.dataset.sure=1;r.textContent="Tap again to erase";root.querySelector("#s-conf").innerHTML=`<div class="confirm">This deletes all trades, tasks, journal entries and settings on this phone. Save a backup first if you might want them back.</div>`;return}
   S=defaults();save();closeSheet();renderAll();toast("Everything erased")}})}
function exportData(){const blob=new Blob([JSON.stringify(S,null,1)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`daily-hq-backup-${dkey()}.json`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);toast("Backup saved to your downloads")}
$("importfile").onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const d=JSON.parse(await f.text());if(d.v!==1||!d.trades||!d.journal)throw 0;S=d;save();closeSheet();renderAll();toast("Backup restored")}catch(x){toast("That file isn't a Daily HQ backup")}e.target.value=""};

/* ================= home theatre ================= */
const CARDS=[
 {pal:0,go:["trades",{acct:"poly"}],k:()=>"Polymarket",s:()=>S.ui.tf==="All"?"All timeframes":S.ui.tf,
  h:()=>{const st=stats("poly","All");if(!S.settings.wallet&&!st.all.length)return "Connect your wallet to start tracking";if(!st.res.some(t=>sameDay(t.ts)))return "No settled trades yet today";return `You're ${st.today>=0?"up":"down"} $${Math.abs(st.today).toFixed(2)} today`},
  i:()=>{const st=stats("poly",S.ui.tf==="All"?"All":S.ui.tf);return st.res.length?`Win rate ${st.wr}% across ${st.res.length} settled trades${S.ui.tf==="All"?"":" on "+S.ui.tf}.`:"Trades sync from your wallet and land here automatically."},
  f:()=>{const st=stats("poly","All");return[["Score",st.w+"–"+st.l],["Streak",st.st],["Synced",S.settings.wallet?ago(S.sync.last):"Not set up"]]},b:()=>!S.settings.wallet&&!stats("poly","All").all.length?"Set up sync":"Open trades"},
 {pal:1,go:["today"],k:()=>"Today",s:()=>new Date().toLocaleDateString([], {weekday:"long",month:"long",day:"numeric"}),
  h:()=>{const n=nextInfo();return n.t?(n.kind==="now"?"Now: ":n.kind==="missed"?"Catch up: ":"Next: ")+n.t.t+(n.t.time&&n.kind!=="now"?" at "+n.t.time:""):"Day cleared"},
  i:()=>"Your routine comes back every morning. Finish every task to grow your streak.",
  f:()=>{const k=dkey(),l=tasksFor(k).filter(x=>!x.optional),d=l.filter(x=>S.days[k]&&S.days[k].done[x.id]).length;return[["Done",d+" of "+l.length],["XP",S.xp],["Streak",streak()+" days"]]},b:()=>"Open Today"},
 {pal:2,go:["journal",{book:"dreams"}],k:()=>"Journal",s:()=>"Dreams",
  h:()=>{const l=[...S.journal.dreams].sort((a,b)=>b.ts-a.ts)[0];return l?"Last dream: "+l.title:"Write down last night's dream"},
  i:()=>"Dreams, business ideas, notes, emotions and "+bookName("gratitude").toLowerCase()+", all in one place.",
  f:()=>[["Dreams",S.journal.dreams.length],["Ideas",S.journal.ideas.length],["All entries",BOOKS.reduce((s,b)=>s+S.journal[b[0]].length,0)]],b:()=>"Open journal"},
 {pal:3,go:["today"],k:()=>"Progress",s:()=>"Level "+level(),
  h:()=>{const s=streak();return s?`${s}-day streak. Keep it going`:"Clear today's list to start a streak"},
  i:()=>`${1000-S.xp%1000} XP to level ${level()+1}. Tasks give 10 XP, trades and journal entries give 5.`,
  f:()=>[["XP",S.xp],["Best streak",Math.max(S.best,streak())+" days"],["Level",level()]],b:()=>"See today"},
 {pal:4,go:["trades",{acct:"bob"}],k:()=>"Manual and Bob",s:()=>"Hand-logged",
  h:()=>{const b=stats("bob","All"),m=stats("manual","All");if(!b.all.length&&!m.all.length)return "Log Bob's trades and your own";return `Bob is ${b.w}–${b.l}, you're ${m.w}–${m.l}`},
  i:()=>"Two separate journals so you can compare Bob's trades with your manual ones.",
  f:()=>{const b=stats("bob","All"),m=stats("manual","All");return[["Bob P&L",pnlStr(b.pnl)],["Manual P&L",pnlStr(m.pnl)],["Today",pnlStr(b.today+m.today)]]},b:()=>"See Bob's trades"}];
const rail=$("rail");
CARDS.forEach((cd,i)=>{const el=document.createElement("article");el.className="card";el.tabIndex=0;
 el.innerHTML=`<div class="surf"><canvas></canvas><div class="shade"></div><div class="glare"></div><div class="meta"><span>Daily HQ / Feed</span><span>${String(i+1).padStart(2,"0")} / ${String(CARDS.length).padStart(2,"0")}</span></div>
 <div class="cover"><div class="k"></div><strong></strong><div class="insight"><div class="ins"></div><div class="facts"></div></div></div><button class="cta"></button></div>`;
 cd.el=el;rail.appendChild(el);
 el.addEventListener("click",e=>{if(drag.moved)return;if(i!==S.ui.card){S.ui.card=i;save();layout();return}
  if(e.target.closest(".cta")||!matchMedia("(hover:hover)").matches&&el.classList.contains("peek")||matchMedia("(hover:hover)").matches)openCard(i);else{el.classList.add("peek")}});
 el.addEventListener("keydown",e=>{if(e.key==="Enter")openCard(i)});
 el.addEventListener("pointermove",e=>{if(RM||i!==S.ui.card||e.pointerType==="touch")return;const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height,sf=el.querySelector(".surf");
  sf.style.setProperty("--rx",((.5-y)*5).toFixed(2)+"deg");sf.style.setProperty("--ry",((x-.5)*7).toFixed(2)+"deg");sf.style.setProperty("--lift","-4px");sf.style.setProperty("--depth","26px");sf.style.setProperty("--gx",x*100+"%");sf.style.setProperty("--gy",y*100+"%")});
 el.addEventListener("pointerenter",e=>{if(i===S.ui.card&&e.pointerType!=="touch")document.body.classList.add("hover")});
 el.addEventListener("pointerleave",()=>{const sf=el.querySelector(".surf");["--rx","--ry","--lift","--depth"].forEach(p=>sf.style.removeProperty(p));document.body.classList.remove("hover")})});
function paintCards(){CARDS.forEach((cd,i)=>{const cv=cd.el.querySelector("canvas");const small=innerWidth<800;paintScene(cv,cd.pal,small?900:1400,small?560:860);cd.amb=lowresOf(cv)})}
function renderCards(){CARDS.forEach(cd=>{const el=cd.el;el.querySelector(".k").innerHTML=`${esc(cd.k())} <span>· ${esc(cd.s())}</span>`;el.querySelector("strong").textContent=cd.h();el.querySelector(".ins").textContent=cd.i();
  el.querySelector(".facts").innerHTML=cd.f().map(f=>`<div><small>${esc(f[0])}</small><b>${esc(f[1])}</b></div>`).join("");el.querySelector(".cta").innerHTML=`${esc(cd.b())} <span aria-hidden="true">→</span>`});
 const lp=$("levelpill");lp.innerHTML=`Level ${level()} <span class="bar"><i style="width:${(S.xp%1000)/10}%"></i></span>`}
let ambFront="ambA";
function setAmbient(pal){const cd=CARDS.find(c=>c.pal===pal)||CARDS[0],back=ambFront==="ambA"?"ambB":"ambA";if(!cd.amb)return;$(back).style.backgroundImage=`url(${cd.amb})`;$(back).classList.remove("b");$(ambFront).classList.add("b");ambFront=back;
 const P=PAL[pal%PAL.length];document.documentElement.style.setProperty("--glow",P.glow);document.documentElement.style.setProperty("--glow2",P.glow2);document.querySelector('meta[name=theme-color]').content=P.sky[0]}
function layout(){const n=CARDS.length;CARDS.forEach((cd,i)=>{let d=i-S.ui.card;if(d>n/2)d-=n;if(d<-n/2)d+=n;cd.el.className="card "+(d===0?"c":Math.abs(d)<=2?"s"+d:"far");cd.el.setAttribute("aria-current",d===0)});setAmbient(CARDS[S.ui.card].pal)}
const step=d=>{S.ui.card=(S.ui.card+d+CARDS.length)%CARDS.length;save();layout()};
$("prev").onclick=()=>step(-1);$("next").onclick=()=>step(1);
addEventListener("keydown",e=>{if(S.view!=="home"||e.target.closest("input,select,textarea")||!$("sheetwrap").hidden)return;if(e.key==="ArrowLeft")step(-1);if(e.key==="ArrowRight")step(1)});
const drag={x:0,y:0,on:false,moved:false};
rail.addEventListener("pointerdown",e=>{if(e.target.closest(".cta"))return;drag.on=true;drag.moved=false;drag.x=e.clientX;drag.y=e.clientY});
addEventListener("pointermove",e=>{if(!drag.on)return;const dx=e.clientX-drag.x;if(Math.abs(dx)>8)drag.moved=true;if(!drag.moved)return;rail.querySelectorAll(".card").forEach(c=>{c.style.setProperty("--dx",dx*.55+"px");c.style.transitionDuration="0s"})});
const endDrag=e=>{if(!drag.on)return;drag.on=false;const dx=e.clientX-drag.x;rail.querySelectorAll(".card").forEach(c=>{c.style.transitionDuration="";c.style.setProperty("--dx","0px")});if(drag.moved&&Math.abs(dx)>50)step(dx<0?1:-1);setTimeout(()=>drag.moved=false,0)};
addEventListener("pointerup",endDrag);addEventListener("pointercancel",endDrag);
addEventListener("pointermove",e=>{if(RM||e.pointerType==="touch")return;$("atmo").style.setProperty("--px",((e.clientX/innerWidth-.5)*-28).toFixed(1)+"px");$("atmo").style.setProperty("--py",((e.clientY/innerHeight-.5)*-18).toFixed(1)+"px")});
function openCard(i){const cd=CARDS[i],el=cd.el;el.classList.remove("peek");if(cd.go[0]==="trades"&&cd.b()==="Set up sync"){openSettings("wallet");return}
 if(RM){go(...cd.go);return}const r=el.getBoundingClientRect(),cl=document.createElement("div");cl.className="expand";cl.style.cssText+=`left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;border-radius:16px;background-image:url(${el.querySelector("canvas").toDataURL("image/jpeg",.7)})`;document.body.appendChild(cl);
 cl.animate([{left:r.left+"px",top:r.top+"px",width:r.width+"px",height:r.height+"px",borderRadius:"16px"},{left:"0px",top:"0px",width:innerWidth+"px",height:innerHeight+"px",borderRadius:"0px"}],{duration:480,easing:"cubic-bezier(.16,1,.3,1)",fill:"forwards"})
 .onfinish=()=>{go(cd.go[0],{...(cd.go[1]||{}),instant:true});cl.animate([{opacity:1},{opacity:0}],{duration:360,easing:"ease-out",fill:"forwards"}).onfinish=()=>cl.remove()}}
document.addEventListener("click",e=>{if(!e.target.closest(".card"))CARDS.forEach(c=>c.el.classList.remove("peek"))});

/* ================= segmented controls ================= */
function segPlace(id){const s=$(id),hl=s.querySelector(".hl"),b=s.querySelector("button.on");if(b&&b.offsetWidth){hl.style.left=b.offsetLeft+"px";hl.style.width=b.offsetWidth+"px"}}
const segAll=()=>requestAnimationFrame(()=>{segPlace("acct");segPlace("tf")});
document.querySelectorAll("#acct button").forEach(b=>b.onclick=()=>{S.ui.acct=b.dataset.a;S.ui.shown=30;shownBal=null;save();renderTrades()});
document.querySelectorAll("#tf button").forEach(b=>b.onclick=()=>{S.ui.tf=b.dataset.t;S.ui.shown=30;save();renderTrades();renderCards()});
$("won").onclick=e=>quickLog(true,e.currentTarget);$("lost").onclick=e=>quickLog(false,e.currentTarget);
$("addtrade").onclick=()=>editTrade(S.ui.acct);

/* ================= routing + dock ================= */
const NAMES={home:"Home",today:"Today",trades:"Trades",journal:"Journal",food:"Food",smoke:"Smoke log"},PALOF={today:1,trades:0,journal:2,food:3,smoke:4};
function go(v,o={}){S.view=v;if(o.acct)S.ui.acct=o.acct;if(o.book)S.ui.book=o.book;
 $("v-home").classList.toggle("off",v!=="home");document.querySelectorAll(".page").forEach(p=>p.classList.toggle("on",p.id==="p-"+v));document.body.classList.toggle("page-mode",v!=="home");
 $("dcore").querySelectorAll(".db").forEach(b=>b.classList.toggle("on",b.dataset.v===v));glide();
 const cr=$("crumb");cr.textContent=NAMES[v];cr.classList.remove("swap");void cr.offsetWidth;cr.classList.add("swap");
 if(v==="home"){renderCards();layout()}else setAmbient(PALOF[v]);
 if(v==="trades"){shownBal=null;renderTrades();const l=$("spark").querySelector(".line");if(l){l.style.animation="none";void l.offsetWidth;l.style.animation=""}if(S.ui.acct==="poly"&&S.settings.wallet&&Date.now()-S.sync.last>60000)sync(false)}
 if(v==="journal")renderJournal();if(v==="today")renderToday();if(v==="food")renderFood();if(v==="smoke")renderSmoke();
 save();scrollTo({top:0,behavior:o.instant?"auto":"smooth"});history.replaceState(null,"","#"+v)}
function glide(){const b=$("dcore").querySelector(".db.on"),g=$("glide");if(!b){g.style.opacity=0;return}g.style.opacity=1;g.style.left=(b.offsetLeft+12)+"px";g.style.width=(b.offsetWidth-24)+"px"}
$("dcore").querySelectorAll(".db").forEach(b=>b.onclick=()=>go(b.dataset.v));
document.querySelector('[data-k="apps"]').onclick=()=>$("dock").classList.toggle("apps");
document.querySelector('[data-k="back"]').onclick=()=>$("dock").classList.remove("apps");
$("logbtn").onclick=()=>go("trades");$("setbtn").onclick=()=>openSettings();$("syncbtn").onclick=()=>sync(true);$("streakbtn").onclick=()=>go("today");$("levelpill").onclick=()=>go("today");

/* ================= orbit ================= */
function orbit(o){$("orbit").classList.toggle("open",o);$("scrim").classList.toggle("on",o);$("orbit").setAttribute("aria-hidden",!o)}
$("assist").onclick=()=>orbit(!$("orbit").classList.contains("open"));$("scrim").onclick=()=>orbit(false);
$("orbit").querySelectorAll(".olab").forEach(b=>b.onclick=()=>{orbit(false);const a=b.dataset.a;
 if(a==="won"||a==="lost"){go("trades");setTimeout(()=>quickLog(a==="won",$(a)),380)}
 if(a==="task"){go("today");setTimeout(()=>$("nt").focus(),380)}
 if(a==="entry"){go("journal");setTimeout(()=>editEntry(S.ui.book),380)}});

/* ================= boot ================= */
function renderAll(){syncRepSelect();renderWeek();renderToday();renderWater();renderTrades();renderJournal();renderFood();renderCards();if(S.view==="home")layout()}
tick();setInterval(tick,10000);
rail.classList.add("still");paintCards();renderAll();layout();requestAnimationFrame(()=>requestAnimationFrame(()=>rail.classList.remove("still")));
const start=(location.hash||"").slice(1);if(start==="dogs"){S.ui.who="dog";go("food",{instant:true})}else if(start==="calm"){go("smoke",{instant:true});setTimeout(openCalm,300)}else go(NAMES[start]?start:"home",{instant:true});
addEventListener("resize",()=>{glide();segAll()});
setInterval(waterTick,60000);setTimeout(waterTick,4000);setInterval(taskTick,30000);setTimeout(taskTick,2000);$("alertsbtn").onclick=()=>NATIVE?nativeAlertsSheet():alertsSheet();if(NATIVE){nativeInit();document.documentElement.classList.add("native")}$("waterbtn").onclick=()=>openWater();
document.addEventListener("visibilitychange",()=>{if(!document.hidden){tick();waterTick();taskTick();scheduleSoon();if(S.settings.wallet&&Date.now()-S.sync.last>120000)sync(false)}});
if(S.settings.wallet&&Date.now()-S.sync.last>120000)setTimeout(()=>sync(false),800);
if("serviceWorker" in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("sw.js").catch(()=>{});
