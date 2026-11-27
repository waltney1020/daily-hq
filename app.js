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
const ACCTS={poly:"Polymarket",pred:"Prediction",cb:"Coinbase",fut:"Futures",dman:"Derivatives (manual)",spot:"Spot",bob:"Bob"};
const DSUBN={cb:"Coinbase",fut:"Futures",dman:"Manual"},dsubOf=()=>S.ui.dsub in DSUBN?S.ui.dsub:"cb";
const GROUPS=["Morning","Afternoon","Evening","Hair care","Weekly","Anytime"];
const DOW=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],DOWL=["Sundays","Mondays","Tuesdays","Wednesdays","Thursdays","Fridays","Saturdays"];
/* the user's checklist; bump PACK when it changes so installed apps pick it up */
const PACK=12;
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
 settings:{wallet:"",btcOnly:true,bank:{poly:0,pred:0,cb:0,fut:0,dman:0,spot:0,bob:0},stake:{poly:10,pred:10,cb:10,fut:10,dman:10,spot:10,bob:10},label:{poly:"BTC Up/Down",pred:"Prediction",cb:"BTC-PERP",fut:"ES",dman:"",spot:"BTC",bob:"BTC"},book5:"Gratitude"},
 trades:{poly:[],pred:[],cb:[],fut:[],dman:[],spot:[],bob:[]},sync:{last:0,err:""},
 routine:[],pack:0,
 days:{},journal:{dreams:[],ideas:[],notes:[],emotions:[],gratitude:[]},xp:0,best:0,food:{recipes:[],grocery:{}},weights:{},water:{...WATER_DEFAULT,log:{}},smoke:{sessions:[],urges:[],active:null},money:{items:[],budget:0,pay:"Card"},dogs:JSON.parse(JSON.stringify(DOGS_DEFAULT)),
 ui:{acct:"poly",tf:"5m",book:"dreams",card:0,shown:30,tsec:"all",dsub:"cb",trange:"Week",tview:"curve"}}}
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
 if(pack0<11){const fin=S.routine.find(r=>r.t==="Weekly finance update");if(fin&&!fin.link)Object.assign(fin,{link:"money",note:"Review this month in Money: total vs budget, top categories, anything to cut."});S.money=S.money||{items:[],budget:0,pay:"Card"}}
 if(pack0<10){for(const [k,x] of ONE_OFFS){if(k<dkey())continue;const dd=S.days[k]||(S.days[k]={done:{},extra:[]});if(!dd.extra.some(e=>e.t===x.t))dd.extra.push({id:uid(),...x})}}
 if(S.trades.manual){const m=S.trades.manual;S.trades.pred=[...(S.trades.pred||[]),...m];for(const f of ["bank","stake","label"])if(S.settings[f]&&S.settings[f].manual!==undefined){if(f==="bank")S.settings.bank.pred=(+S.settings.bank.pred||0)+(+S.settings.bank.manual||0);else if(S.settings[f].pred===undefined)S.settings[f].pred=S.settings[f].manual;delete S.settings[f].manual}delete S.trades.manual}
 for(const a of Object.keys(ACCTS)){S.trades[a]=S.trades[a]||[];for(const f of ["bank","stake","label"]){S.settings[f]=S.settings[f]||{};if(S.settings[f][a]===undefined)S.settings[f][a]=f==="label"?d.settings.label[a]:f==="stake"?10:0}}
 if(S.ui.acct==="manual")S.ui.acct="pred";
 S.pack=PACK})();
let saveT;function save(){clearTimeout(saveT);saveT=setTimeout(()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){toast("Couldn't save. Your phone storage may be full.")}if(typeof scheduleSoon==="function")scheduleSoon()},150)}
addEventListener("pagehide",()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}});
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}

/* ================= feedback ================= */
function toast(t,btn,fn){document.querySelectorAll(".toast").forEach(x=>x.remove());const d=document.createElement("div");d.className="toast"+(btn?" long":"");d.innerHTML=`<span>${esc(t)}</span>`;if(btn){const b=document.createElement("button");b.textContent=btn;b.onclick=()=>{d.remove();fn()};d.appendChild(b)}document.body.appendChild(d);setTimeout(()=>d.remove(),btn?4600:2700)}
function burst(el,colors=["#EFBC90","#86D3B0","#F6E3CC","#7AB8B8"]){if(RM||!el)return;const r=el.getBoundingClientRect();for(let i=0;i<18;i++){const p=document.createElement("i");p.className="burst";p.style.left=(r.left+r.width/2)+"px";p.style.top=(r.top+r.height/2)+"px";p.style.background=colors[i%colors.length];const a=Math.random()*Math.PI*2,d=50+Math.random()*90;p.style.setProperty("--bx",Math.cos(a)*d+"px");p.style.setProperty("--by",Math.sin(a)*d-30+"px");p.style.setProperty("--br",Math.random()*540+"deg");document.body.appendChild(p);setTimeout(()=>p.remove(),900)}}
function countUp(el,to,from){if(RM||from===to){el.textContent=money(to);return}const t0=performance.now();(function f(t){const k=Math.min(1,(t-t0)/900),e=1-Math.pow(1-k,3);el.textContent=money(from+(to-from)*e);if(k<1)requestAnimationFrame(f)})(t0)}
const level=()=>Math.floor(S.xp/1000)+1;
function addXP(n,el){const before=level();S.xp=Math.max(0,S.xp+n);if(n&&typeof earn==="function")earn(n,XP_LABEL[n]||(n>0?"Earned":"Undone"));if(n>0&&level()>before){setTimeout(()=>{toast("Level up! You're level "+level());burst(el||document.body)},300)}}

/* ================= clock + week ================= */
function tick(){const d=new Date(),h=d.getHours()%12||12,m=String(d.getMinutes()).padStart(2,"0");$("time").innerHTML=`${h}<i>:</i>${m}`;$("dt").textContent=d.toLocaleDateString([], {weekday:"long",month:"long",day:"numeric"});setGreet();
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
/* ===== Task room: opening a task grows its row into a full-screen page with a mountain header in the
   task's color, a progress ring, the rule, step tiles and a 7-day strip. Finishing celebrates, then the page
   shrinks back into the row. (Replaces the old steps sheet; same data and actions.) ===== */
const STEP_ICONS=[[/bonnet|night|sleep|bed\b/i,"🌙"],[/mist|spray|water/i,"💧"],[/reshape|scrunch|define|curls? with/i,"🌀"],[/peptide|serum|minoxidil|drops?\b/i,"🧪"],[/shampoo|wash|cleans|rinse/i,"🫧"],
 [/condition|cream|moistur|lotion|oil\b|butter|balm/i,"🧴"],[/spf|sunscreen|\bsun\b/i,"☀️"],[/vitamin c|brighten/i,"🍋"],[/retin|tret|exfoli|\baha\b|\bbha\b|acid/i,"⚗️"],[/towel|t-shirt|diffus|air.?dry/i,"🌬️"],
 [/comb|brush|detangl/i,"🪮"],[/walk|cardio|\brun\b|bike|treadmill|steps\b/i,"🚶"],[/stretch|mobility|yoga|foam/i,"🧘"],[/\brow\b|pull|\blat\b|deadlift/i,"🏋️"],[/curl|bicep|hammer/i,"💪"],
 [/press|bench|push|chest|\bdip/i,"🏋️"],[/squat|lunge|\bleg|calf|glute/i,"🦵"],[/plank|core|\babs?\b|crunch/i,"🎯"],[/\bfly\b|delt|shoulder|raise/i,"🪽"],
 [/\beat\b|meal|cook|prep|protein|breakfast|lunch|dinner|snack/i,"🍽️"],[/read|review|journal|write|plan\b/i,"📝"]];
const stepIcon=s=>{for(const [re,ic] of STEP_ICONS)if(re.test(s))return ic;return""};
const splitStep=s=>{const m=/^(.*?)\s*\(([^)]+)\)\s*$/.exec(s);return m?[m[1],m[2]]:[s,""]};
const roomTheme=t=>t.g==="Hair care"?2:isSkin(t)?1:(t.main||/workout|training|cardio|gym|lift/i.test(t.t))?3:(t.link||t.recipe)?4:0;
let RO=null,roomGen=0;
function roomOrigin(id){if(!$("p-today").classList.contains("on"))return null;let el=id===doNextId?$("donext"):null;
 if(!el){const b=document.querySelector(`#tasks .main[data-id="${id}"]`);el=b&&b.closest(".tlr")}if(!el)return null;
 const r=el.getBoundingClientRect();return(!r.width||r.bottom<0||r.top>innerHeight)?null:r}
const roomClip=r=>r?`inset(${Math.max(0,r.top).toFixed(1)}px ${Math.max(0,innerWidth-r.right).toFixed(1)}px ${Math.max(0,innerHeight-r.bottom).toFixed(1)}px ${Math.max(0,r.left).toFixed(1)}px round 14px)`:"inset(42% 18% 42% 18% round 24px)";
function openSteps(id){const k=dkey(),t=tasksFor(k).find(x=>x.id===id),el=$("troom");if(!t||!el)return;
 const pi=roomTheme(t),P=PAL[pi%PAL.length];el.style.setProperty("--acc",P.road[0]);el.style.setProperty("--tbg",P.sky[0]);
 const d=Math.min(2,devicePixelRatio||1);paintScene($("trcv"),pi,Math.round(Math.min(1800,innerWidth*d)),Math.round(340*d),11+id.length);
 roomGen++;el.getAnimations().forEach(a=>a.cancel());RO={id,k};el.classList.remove("water");drawRoom();roomShow(roomOrigin(id))}
// shared opening: grow out of the origin rect (or a small center box), dim Today behind, then let the content rise in
function roomShow(r){const el=$("troom");el.classList.remove("in","cele");el.classList.add("on","entering");$("trs").scrollTop=0;document.body.classList.add("roomopen");
 if(!RM){el.animate([{clipPath:roomClip(r)},{clipPath:"inset(0px 0px 0px 0px round 0px)"}],{duration:760,easing:"cubic-bezier(.32,.72,0,1)"});
  document.querySelector(".app").animate([{filter:"none"},{filter:"blur(5px) brightness(.55)"}],{duration:760,fill:"forwards"})}
 requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add("in")));setTimeout(()=>el.classList.add("in"),120);setTimeout(()=>el.classList.remove("entering"),1100)}
function roomFlash(icon,title,sub,thenClose){const el=$("troom"),c=el.querySelector(".trcele>div");c.innerHTML=`<div class="trck">${icon}</div><b>${esc(title)}</b><span>${esc(sub)}</span>`;el.classList.add("cele");
 try{navigator.vibrate&&navigator.vibrate([10,40,18])}catch(e){}clearTimeout(roomFlash.t);roomFlash.t=setTimeout(()=>thenClose?closeRoom():el.classList.remove("cele"),thenClose?1150:1700)}
function closeRoom(instant){const el=$("troom");if(!el||!el.classList.contains("on"))return;const id=RO&&RO.id;el.classList.remove("in","entering");document.body.classList.remove("roomopen");
 const app=document.querySelector(".app"),gen=++roomGen;let done=false;const fin=()=>{if(done||gen!==roomGen)return;done=true;el.getAnimations().forEach(a=>a.cancel());el.classList.remove("on","cele");app.getAnimations().forEach(a=>a.cancel());if(RO&&RO.id===id)RO=null};
 if(instant||RM||document.hidden){fin();return}
 app.getAnimations().forEach(a=>a.reverse());const r=RO&&RO.origin?RO.origin():id&&roomOrigin(id);
 el.animate([{clipPath:"inset(0px 0px 0px 0px round 0px)"},{clipPath:roomClip(r)}],{duration:560,easing:"cubic-bezier(.32,.72,0,1)",fill:"forwards"}).onfinish=fin;
 setTimeout(fin,700)} // backup: never leave the room stuck on screen if the animation is paused
function roomCelebrate(){roomFlash("✓","Done","+10 XP",true)}
function drawRoom(){if(!RO)return;if(RO.kind==="water")return drawWaterRoom();if(RO.kind==="streak")return drawStreakRoom();if(RO.kind==="food")return drawFoodRoom();const {id,k}=RO,t=tasksFor(k).find(x=>x.id===id);if(!t){closeRoom(true);return}
 const dd=dayData(k),steps=stepList(k,t),sk=stepKey(k,t),s=(dd.steps||{})[sk]||{},n=stepsDone(k,t),total=steps.length,isDone=!!dd.done[id],pct=isDone?100:total?Math.round(n/total*100):0,RC=94.25;
 const adh=t.g==="Hair care"?{...adherence(x=>x.g==="Hair care",S.hairStart),label:"Hair routine",target:" Target 85–100%."}:isSkin(t)?{...adherence(isSkin,S.skinStart),label:"Skin routines",target:""}:t.main?{...adherence(x=>!!x.main,S.fitStart),label:"Main workouts",target:" Target: 5 a week."}:null;
 const lr=t.link&&ROLE_LABEL[t.link]?recipeFor(t.link,k):null,phase=phaseFor(t,k)||(lr?[0,0,"Week "+mealWeek(k)+" · "+MENU_THEMES[mealWeek(k)-1]+": "+lr.name]:null),minDone=dd.minDone&&dd.minDone[id];
 const variant=t.alt?`<div class="seg vseg"><span class="hl"></span><button type="button" data-v="0" class="${useAlt(k,t)?"":"on"}">${esc(t.mainName||"Main")}</button><button type="button" data-v="1" class="${useAlt(k,t)?"on":""}">${esc(t.altName||"Alternative")}</button></div>`:"";
 const bars=[...Array(7)].map((_,i)=>{const x=new Date();x.setDate(x.getDate()-6+i);const kk=dkey(x),due=tasksFor(kk).some(y=>y.id===id),done=!!(S.days[kk]&&S.days[kk].done[id]);return`<i class="${done?"f":due?"":"n"}" title="${x.toLocaleDateString([], {weekday:"short"})}"></i>`}).join("");
 const meta=[t.rep?repLabel(t)||"Every day":"Today only",t.g&&t.g!=="Anytime"?t.g.replace(/ care$/,""):""].filter(Boolean).join(" · ");
 $("trs").innerHTML=`<div class="trbar"><button class="trib" id="tr-back" aria-label="Back"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg></button><span class="treb">${esc(meta)}</span><button class="trib" id="tr-edit" aria-label="Edit task"><svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg></button></div>
 <div class="trin">
  <div class="trhero"><div><h2>${esc(t.t)}</h2><div class="trsub">${total?`${isDone&&n<total?"Done":`${n} of ${total} steps`}`:isDone?"Done":"Tap below when it's done"}${t.time?` · ${esc(t.time)}`:""}${t.optional?" · Optional":""}</div></div>
   <div class="trring"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,.13)" stroke-width="3"/><circle class="p" cx="18" cy="18" r="15" fill="none" stroke="var(--acc)" stroke-width="3" stroke-linecap="round" stroke-dasharray="${(pct/100*RC).toFixed(1)} ${RC}" transform="rotate(-90 18 18)"/></svg><b>${pct}%</b></div></div>
  ${phase?`<div class="trnote"><b>This week</b>${esc(phase[2])}</div>`:""}
  ${minDone?`<div class="trnote"><b>Done</b>Minimum routine today (${esc(t.min)}). That counts.</div>`:""}
  ${t.note?`<div class="trrule ${t.note.length>150?"clamp":""}" id="tr-rule"><i>!</i><span>${esc(t.note)}</span></div>`:""}
  ${variant}
  ${total?`<div class="trgrid">${steps.map((x,i)=>{const [a,w]=splitStep(x),ic=stepIcon(a);return`<button type="button" class="trtile ${s[i]?"on":""} ${total%2&&i===total-1?"wide":""}" data-i="${i}" style="--d:${i}" aria-pressed="${!!s[i]}">${ic?`<span class="tic">${ic}</span>`:`<span class="tic num">${i+1}</span>`}<span class="tx">${esc(a)}${w?`<small>⚠ ${esc(w)}</small>`:""}</span></button>`}).join("")}</div>`:""}
  <div class="trwk"><span>${bars}</span>${adh&&adh.pct!==null?`${adh.label}: ${adh.done} of ${adh.due} in the last 7 days (${adh.pct}%).${adh.target}`:"Last 7 days"}</div>
  ${t.min&&!isDone?`<p class="trmin">Low-energy day? Minimum: ${esc(t.min)}. It still counts.</p>`:""}
 </div>`;
 $("trfoot").innerHTML=`<div class="trfin"><button class="trp ${isDone?"undo":""}" id="st-all">${isDone?"Mark not done":total?"Mark all done":"Mark done"}</button>${t.link?`<button id="st-link">${esc(linkLabel(t.link))} →</button>`:""}${t.recipe?`<button id="st-rec">Recipe →</button>`:""}${t.min&&!isDone?`<button id="st-min">Did the minimum</button>`:""}</div>`;
 const R=$("troom"),q=s=>R.querySelector(s);
 q("#tr-back").onclick=()=>closeRoom();q("#tr-edit").onclick=()=>editTask(id);
 const rule=q("#tr-rule");if(rule)rule.onclick=()=>rule.classList.toggle("clamp");
 const lb=q("#st-link");if(lb)lb.onclick=()=>{closeRoom(true);followLink(t.link,id)};
 const rb=q("#st-rec");if(rb)rb.onclick=()=>openRecipe(t.recipe);
 const mb=q("#st-min");if(mb)mb.onclick=e=>{const d2=dayData(k);(d2.minDone=d2.minDone||{})[id]=true;toggleTask(id,e.currentTarget);drawRoom();roomCelebrate()};
 const vs=q(".vseg");if(vs){const place=()=>{const b=vs.querySelector("button.on"),hl=vs.querySelector(".hl");if(b&&hl){hl.style.left=b.offsetLeft+"px";hl.style.width=b.offsetWidth+"px"}};requestAnimationFrame(place);
  vs.querySelectorAll("button").forEach(b=>b.onclick=()=>{const d2=dayData(k);d2.variant=d2.variant||{};if(b.dataset.v==="1")d2.variant[id]=true;else delete d2.variant[id];save();renderToday();drawRoom()})}
 R.querySelectorAll(".trtile").forEach(b=>b.onclick=()=>{const d2=dayData(k);d2.steps=d2.steps||{};const m=d2.steps[sk]=d2.steps[sk]||{};const i=+b.dataset.i;m[i]=!m[i];if(!m[i])delete m[i];try{navigator.vibrate&&navigator.vibrate(8)}catch(e){}
  const all=stepsDone(k,t)===total;let fin=false;if(all&&!d2.done[id]){toggleTask(id,b);fin=true}else if(!all&&d2.done[id])toggleTask(id,b);else{save();renderToday()}drawRoom();if(fin)roomCelebrate()});
 q("#st-all").onclick=e=>{const d2=dayData(k);d2.steps=d2.steps||{};if(d2.done[id]){d2.steps[sk]={};if(d2.minDone)delete d2.minDone[id];toggleTask(id,e.currentTarget);drawRoom()}
  else{d2.steps[sk]=Object.fromEntries(steps.map((_,i)=>[i,true]));toggleTask(id,e.currentTarget);drawRoom();roomCelebrate()}}}
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

// stats across one or more ledgers, for a time range (Today / Week / Month / All); Polymarket can also filter by market timeframe
function tstats(accs,range="All",tf){const now=Date.now(),cut=range==="Today"?new Date().setHours(0,0,0,0):range==="Week"?now-7*864e5:range==="Month"?now-30*864e5:0;
 const items=accs.flatMap(a=>(S.trades[a]||[]).filter(t=>!t.hidden&&(a!=="poly"||!tf||tf==="All"||t.tf===tf)).map(t=>({...t,_a:a})));
 const inR=items.filter(t=>t.ts>=cut),closed=inR.filter(t=>t.res==="win"||t.res==="loss"),sorted=[...closed].sort((x,y)=>y.ts-x.ts);
 const wins=closed.filter(t=>t.res==="win"),losses=closed.filter(t=>t.res==="loss"),sum=l=>l.reduce((s,t)=>s+(+t.pnl||0),0),allClosed=items.filter(t=>t.res==="win"||t.res==="loss");
 let st="–";if(sorted.length){let n=0;const r0=sorted[0].res;for(const t of sorted){if(t.res===r0)n++;else break}st=(r0==="win"?"W":"L")+n}
 return{items,inR,closed,w:wins.length,l:losses.length,wr:closed.length?Math.round(wins.length/closed.length*100):null,st,pnl:sum(closed),today:sum(allClosed.filter(t=>sameDay(t.ts))),
  avgW:wins.length?sum(wins)/wins.length:0,avgL:losses.length?sum(losses)/losses.length:0,bal:accs.reduce((s,a)=>s+(+S.settings.bank[a]||0),0)+sum(allClosed),open:inR.filter(t=>t.res==="open")}}
// spot holdings from buys and sells (average cost)
function holdings(){const h={};(S.trades.spot||[]).filter(t=>!t.hidden).sort((a,b)=>a.ts-b.ts).forEach(t=>{const k=(t.title||"?").trim().toUpperCase(),q=+t.qty||0,p=+t.price||0,x=h[k]||(h[k]={asset:k,qty:0,cost:0});
  if(t.side==="Sell"){const avg=x.qty?x.cost/x.qty:0;x.cost=Math.max(0,x.cost-avg*Math.min(q,x.qty));x.qty=Math.max(0,x.qty-q)}else{x.qty+=q;x.cost+=t.cost!=null&&t.cost!==""?+t.cost:q*p}});
 return Object.values(h).filter(x=>x.qty>1e-9)}

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
/* ================= trades: page (v2) =================
   Five sections as swipeable account cards: All · Polymarket · Prediction · Derivatives (Coinbase / Futures) · Spot · Bob.
   The cards rotate on their own every 6 s; touching pauses, tapping holds a card for 20 s.
   Below: sync status, a performance card (equity curve or month calendar), stats, quick log buttons that fit the
   section (Won/Lost, Long/Short, Buy/Sell) and the trade list. */
const TKIND={poly:"wl",pred:"wl",cb:"ls",fut:"ls",dman:"ls",spot:"bs",bob:"ls"};
const TSEC=[
 {k:"all",n:"All sections",ic:"Σ",bg:"linear-gradient(150deg,#3A4A52,#121C20)",accs:()=>Object.keys(ACCTS)},
 {k:"poly",n:"Polymarket",ic:"PM",bg:"linear-gradient(150deg,#2A4FD6,#14236B)",accs:()=>["poly"]},
 {k:"pred",n:"Prediction",ic:"◎",bg:"linear-gradient(150deg,#6E50C9,#2B1D5C)",accs:()=>["pred"]},
 {k:"deriv",n:"Derivatives",ic:"⚡",bg:"linear-gradient(150deg,#C26A22,#4A2410)",accs:()=>[dsubOf()]},
 {k:"spot",n:"Spot",ic:"◐",bg:"linear-gradient(150deg,#1D8F6E,#0B3A2D)",accs:()=>["spot"]},
 {k:"bob",n:"Bob",ic:"B",bg:"linear-gradient(150deg,#B8921C,#4A3A0A)",accs:()=>["bob"]}];
const txSec=()=>TSEC.find(s=>s.k===S.ui.tsec)||TSEC[0];
const fmtP=n=>(+n).toLocaleString(undefined,{maximumFractionDigits:6});
let txTimer=null,txHeld=0,txTouch=false,txDay=null,txScrollT=null;
function txSpark(accs){const c=accs.flatMap(a=>(S.trades[a]||[]).filter(t=>!t.hidden&&(t.res==="win"||t.res==="loss"))).sort((x,y)=>x.ts-y.ts).slice(-30);let v=0;const ys=[0,...c.map(t=>v+=(+t.pnl||0))];
 if(ys.length<3)return"M0 40 L200 40";const mn=Math.min(...ys),mx=Math.max(...ys),sp=mx-mn||1;return ys.map((y,i)=>`${i?"L":"M"}${(i/(ys.length-1)*200).toFixed(1)} ${(46-(y-mn)/sp*38).toFixed(1)}`).join(" ")}
function txRow(x,showAcct){const k=TKIND[x._a],sd=(x.side||"").toLowerCase();let tag,tc;
 if(["long","short","buy","sell"].includes(sd)){tag=x.side.toUpperCase();tc=sd==="long"||sd==="buy"?"l":"s"}else{tag=x.res==="win"?"WON":x.res==="loss"?"LOST":"OPEN";tc=x.res==="win"?"l":x.res==="loss"?"s":"o"}
 const det=k==="ls"?[x.entry?`${fmtP(x.entry)} → ${x.exit?fmtP(x.exit):"open"}`:"",x.size?"size "+fmtP(x.size):"",x.lev?x.lev+"x":"",x.venue||""]
  :k==="bs"?[x.qty?`${fmtP(x.qty)} @ ${fmtP(x.price||0)}`:""]:[x.side||"",x.tf||"",x.cost?"$"+(+x.cost).toFixed(2)+" in":""];
 const ou=x.res==="open"&&x.upnl!=null,right=x.res==="open"?(k==="bs"?money(+x.cost||0):ou?pnlStr(x.upnl):"open"):pnlStr(+x.pnl||0),rc=x.res==="open"?(ou?(x.upnl>0?"up":x.upnl<0?"dn":""):""):x.pnl>0?"up":x.pnl<0?"dn":"";
 return`<button class="txrow" data-a="${x._a}" data-id="${x.id}"><span class="txtag ${tc}">${tag}</span><span class="m"><span class="t">${esc(x.title||ACCTS[x._a])}</span><small>${esc([showAcct?ACCTS[x._a]:"",...det,x.res==="open"&&x.src==="sync"?"open now":whenStr(x.ts),x.src==="sync"?"synced":"",x.estimate?"P&L estimate":"",x.edited?"edited":""].filter(Boolean).join(" · "))}</small></span><b class="num ${rc}">${right}</b></button>`}
function syncHtml(sec,accs){if(sec.k==="poly"||sec.k==="all"){const w=S.settings.wallet;
  if(!w)return`<span class="pdot off"></span><button class="link" id="connect" style="color:#F1C39D;padding:0">Connect your Polymarket wallet to auto-sync</button>`;
  return`<span class="pdot ${S.sync.err?"err":""}"></span><span>${esc(S.sync.err||"Polymarket synced "+ago(S.sync.last))}</span><button class="txpill" id="syncnow">Sync now</button>`}
 if(accs[0]==="cb"){const k=cbKey(),c=S.cbsync||{};if(!k)return`<span class="pdot off"></span><span>Coinbase not connected</span><button class="txpill" id="cbconnect">Connect Coinbase</button>`;
  return`<span class="pdot ${c.err?"err":""}"></span><span>${esc(c.err||(NATIVE?"Coinbase synced "+ago(c.last):"Coinbase syncs in the Fold app"))}${c.upnl!=null&&!c.err?` · unrealized ${pnlStr(c.upnl)}`:""}</span><button class="txpill" id="cbsyncnow">${NATIVE?"Sync now":"Details"}</button>`}
 if(accs[0]==="bob")return`<span class="pdot off"></span><span>Logged by hand. Pionex.US auto-sync isn't available yet.</span>`;
 return`<span class="pdot off"></span><span>Logged by hand</span>`}
function renderSyncLine(msg){const el=$("syncline");if(!el)return;const sec=txSec();el.innerHTML=msg?`<span class="pdot"></span><span>${esc(msg)}</span>`:syncHtml(sec,sec.accs());$("syncdot").hidden=!!S.settings.wallet;
 const c=$("connect");if(c)c.onclick=()=>openSettings("wallet");const sn=$("syncnow");if(sn)sn.onclick=()=>sync(true);const cc=$("cbconnect");if(cc)cc.onclick=()=>cbConnectSheet();const cs=$("cbsyncnow");if(cs)cs.onclick=()=>NATIVE?cbSync(true):cbConnectSheet()}
let shownBal=null;
function renderTrades(){if(!$("txcards"))return;const sec=txSec(),accs=sec.accs(),kind=sec.k==="all"?"all":TKIND[accs[0]],range=S.ui.trange||"Week",view=S.ui.tview||"curve",tf=sec.k==="poly"?S.ui.tf:undefined;
 const allSt=tstats(Object.keys(ACCTS),"All"),tt=$("txtoday");tt.textContent=pnlStr(allSt.today);tt.className="num "+(allSt.today>0?"up":allSt.today<0?"dn":"");
 txPaintCards(TSEC.map(s=>{const st=tstats(s.accs(),"All"),spot=s.k==="spot",bal=spot?holdings().reduce((t,h)=>t+h.cost,0):st.bal,auto=((s.k==="poly"||s.k==="all")&&!!S.settings.wallet)||(s.k==="deriv"&&dsubOf()==="cb"&&!!cbKey());
  return`<button class="txc ${s.k===sec.k?"on":""}" data-s="${s.k}" style="--bgc:${s.bg}"><span class="h"><span class="ic">${s.ic}</span><span class="lab">${s.k==="deriv"?"Derivatives · "+DSUBN[dsubOf()]:s.n}${auto?"<i>AUTO</i>":""}</span></span><span class="bal num">${money(bal)}</span><span class="pl num" style="color:${!spot&&st.today<0?"#FFC2BC":"#C8F2DE"}">${spot?"invested · "+holdings().length+" holdings":pnlStr(st.today)+" today"}</span><svg viewBox="0 0 200 52" preserveAspectRatio="none" aria-hidden="true"><path d="${txSpark(s.accs())}" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="2" vector-effect="non-scaling-stroke"/></svg></button>`}));
 $("txdots").innerHTML=TSEC.map(s=>`<i class="${s.k===sec.k?"on":""}"></i>`).join("");$("txdots").classList.toggle("held",txHeld>Date.now()||RM);
 const st=tstats(accs,range,tf),hold=kind==="bs"?holdings():null;
 // performance: curve or calendar
 const pts=[...st.closed].sort((a,b)=>a.ts-b.ts);let acc=0;const ys=[0,...pts.map(t=>acc+=(+t.pnl||0))],up=acc>=0,lc=up?"#86D3B0":"#EE8E86";
 let curve;if(ys.length<3)curve=`<div class="txempty">Your P&amp;L line appears after a few closed trades${range!=="All"?" in this range":""}.</div>`;
 else{const mn=Math.min(...ys),mx=Math.max(...ys),sp=mx-mn||1,X=i=>i/(ys.length-1)*600,Y=v=>132-(v-mn)/sp*120,line=ys.map((v,i)=>(i?"L":"M")+X(i).toFixed(1)+" "+Y(v).toFixed(1)).join(" ");
  curve=`<svg class="txcurve" viewBox="0 0 600 140" preserveAspectRatio="none" aria-label="P&L over time"><defs><linearGradient id="txg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${lc}" stop-opacity=".28"/><stop offset="1" stop-color="${lc}" stop-opacity="0"/></linearGradient></defs>${[0,1,2,3].map(i=>`<line x1="0" x2="600" y1="${12+i*40}" y2="${12+i*40}" stroke="rgba(255,255,255,.06)" vector-effect="non-scaling-stroke"/>`).join("")}${mn<0&&mx>0?`<line x1="0" x2="600" y1="${Y(0)}" y2="${Y(0)}" stroke="rgba(255,255,255,.22)" stroke-dasharray="4 6" vector-effect="non-scaling-stroke"/>`:""}<path d="${line} L600 140 L0 140Z" fill="url(#txg)"/><path d="${line}" fill="none" stroke="${lc}" stroke-width="2.2" vector-effect="non-scaling-stroke"/></svg>`}
 const now=new Date(),Y0=now.getFullYear(),M0=now.getMonth(),dim=new Date(Y0,M0+1,0).getDate(),off=(new Date(Y0,M0,1).getDay()+6)%7,daySum=Array(dim).fill(null);
 st.items.filter(t=>(t.res==="win"||t.res==="loss")&&new Date(t.ts).getFullYear()===Y0&&new Date(t.ts).getMonth()===M0).forEach(t=>{const d=new Date(t.ts).getDate()-1;daySum[d]=(daySum[d]||0)+(+t.pnl||0)});
 const dmx=Math.max(1,...daySum.filter(v=>v!==null).map(Math.abs)),dcol=v=>v===null?"":v>0?`background:rgba(134,211,176,${(.2+.6*v/dmx).toFixed(2)})`:v<0?`background:rgba(238,142,134,${(.2+.6*-v/dmx).toFixed(2)})`:"background:rgba(255,255,255,.08)";
 const green=daySum.filter(v=>v>0).length,red=daySum.filter(v=>v<0).length,monthPnl=daySum.reduce((t,v)=>t+(v||0),0);
 const cal=`<div class="txcal">${["M","T","W","T","F","S","S"].map(d=>`<span class="h">${d}</span>`).join("")}${"<span class='h'></span>".repeat(off)}${daySum.map((v,i)=>`<button class="${i+1===txDay?"sel":""} ${i+1===now.getDate()?"today":""}" data-d="${i+1}" style="${dcol(v)}" aria-label="${now.toLocaleDateString([], {month:"short"})} ${i+1}${v!==null?": "+pnlStr(v):""}">${i+1}</button>`).join("")}</div><div class="txlegend"><span>● Loss</span><span>Tap a day</span><span>Profit ●</span></div>`;
 const headPnl=view==="cal"?monthPnl:st.pnl;
 // list
 let list=view==="cal"&&txDay?st.items.filter(t=>{const d=new Date(t.ts);return d.getFullYear()===Y0&&d.getMonth()===M0&&d.getDate()===txDay}):st.inR;list=[...list].sort((a,b)=>b.ts-a.ts);const n=S.ui.shown||30;
 const quick=kind==="wl"?[["won","+ Won","w"],["lost","+ Lost","x"]]:kind==="ls"?[["long","+ Long","w"],["short","+ Short","x"]]:kind==="bs"?[["buy","+ Buy","w"],["sell","− Sell","x"]]:null;
 const gridHtml=kind==="bs"?`<div><small>Invested</small><b class="num">${money(hold.reduce((t,h)=>t+h.cost,0))}</b></div><div><small>Realized</small><b class="num ${st.pnl>0?"up":st.pnl<0?"dn":""}">${pnlStr(st.pnl)}</b></div><div><small>Holdings</small><b class="num">${hold.length}</b></div>`
  :`<div><small>Win rate</small><span class="txwr"><svg viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="5"/><circle cx="18" cy="18" r="14" fill="none" stroke="#86D3B0" stroke-width="5" stroke-dasharray="${((st.wr||0)/100*88).toFixed(1)} 88" transform="rotate(-90 18 18)"/></svg><b class="num">${st.wr===null?"–":st.wr+"%"}</b></span></div><div><small>W–L</small><b class="num">${st.w}–${st.l}</b></div><div><small>Streak</small><b class="${/^W/.test(st.st)?"up":/^L/.test(st.st)?"dn":""}">${st.st}</b></div><div><small>Avg win</small><b class="num up">${st.w?pnlStr(st.avgW):"–"}</b></div><div><small>Avg loss</small><b class="num dn">${st.l?pnlStr(st.avgL):"–"}</b></div><div><small>${st.open.length?"Open":"Trades"}</small><b class="num">${st.open.length?st.open.length+" open":st.inR.length}</b></div>`;
 $("txbody").innerHTML=`<div class="txsync" id="syncline">${syncHtml(sec,accs)}</div>
 ${sec.k==="deriv"?`<div class="mseg txsub" role="tablist">${Object.entries(DSUBN).map(([k,n])=>`<button data-d="${k}" class="${dsubOf()===k?"on":""}">${n}</button>`).join("")}</div>`:""}
 ${sec.k==="poly"?`<div class="mseg txsub">${["5m","15m","1h","All"].map(x=>`<button data-tf="${x}" class="${x===S.ui.tf?"on":""}">${x==="All"?"All markets":x}</button>`).join("")}</div>`:""}
 <div class="txperf"><div class="txph"><span class="eyebrow">${view==="cal"?`${esc(sec.n)} · ${now.toLocaleDateString([], {month:"long"})}`:`${esc(sec.n)} · ${range==="All"?"All time":range==="Today"?"Today":"Last "+range.toLowerCase()}`}</span><div class="mseg" id="txview"><button data-v="curve" class="${view==="curve"?"on":""}">Curve</button><button data-v="cal" class="${view==="cal"?"on":""}">Calendar</button></div></div>
  <div class="txpnl num ${headPnl>0?"up":headPnl<0?"dn":""}">${pnlStr(headPnl)}<small>${view==="cal"?`${green} green · ${red} red days`:"P&amp;L"}</small></div>
  ${view==="curve"?`<div class="mseg txrange">${["Today","Week","Month","All"].map(r=>`<button data-r="${r}" class="${r===range?"on":""}">${r}</button>`).join("")}</div>${curve}`:cal}</div>
 <div class="txgrid">${gridHtml}</div>
 ${quick?`<div class="txqa">${quick.map(q=>`<button class="${q[2]}" data-q="${q[0]}">${q[1]}</button>`).join("")}</div>`:""}
 ${hold&&hold.length?`<div class="txh4"><span>Holdings</span><span>avg cost</span></div>${hold.map(h=>`<div class="txrow static"><span class="txtag l">HOLD</span><span class="m"><span class="t">${esc(h.asset)}</span><small>${fmtP(h.qty)} · ${money(h.cost)} invested</small></span><b class="num">${money(h.qty?h.cost/h.qty:0)}</b></div>`).join("")}`:""}
 <div class="txh4"><span>${view==="cal"&&txDay?now.toLocaleDateString([], {month:"long"})+" "+txDay:kind==="bs"?"Buys and sells":"Recent"}</span>${kind!=="all"?`<button class="link" id="addtrade">+ Add with details</button>`:""}</div>
 <div id="log">${list.length?list.slice(0,n).map(x=>txRow(x,sec.k==="all")).join("")+(list.length>n?`<button class="action more" id="moretr">Show more</button>`:""):`<div class="empty"><b>${view==="cal"&&txDay?"No trades that day":sec.k==="poly"&&!S.settings.wallet?"Connect your wallet or log your first trade":"Nothing here yet"}</b>${kind==="all"?"Pick a section and log your first trade.":kind==="wl"?"Tap + Won or + Lost after each trade.":kind==="ls"?"Tap + Long or + Short to log a position.":kind==="bs"?"Tap + Buy when you buy, − Sell when you sell.":""}</div>`}</div>`;
 const B=$("txbody");renderSyncLine();

 B.querySelectorAll("[data-d]").forEach(b=>{if(b.closest(".txsub"))b.onclick=()=>{S.ui.dsub=b.dataset.d;txHold();save();renderTrades()};else b.onclick=()=>{const d=+b.dataset.d;txDay=txDay===d?null:d;txHold();renderTrades()}});
 B.querySelectorAll("[data-tf]").forEach(b=>b.onclick=()=>{S.ui.tf=b.dataset.tf;S.ui.shown=30;txHold();save();renderTrades();renderCards()});
 B.querySelectorAll("#txview button").forEach(b=>b.onclick=()=>{S.ui.tview=b.dataset.v;txDay=null;txHold();save();renderTrades()});
 B.querySelectorAll("[data-r]").forEach(b=>b.onclick=()=>{S.ui.trange=b.dataset.r;txHold();save();renderTrades()});
 B.querySelectorAll("[data-q]").forEach(b=>b.onclick=e=>{const a=accs[0],q=b.dataset.q;txHold();if(q==="won"||q==="lost")quickLog(q==="won",e.currentTarget,a);else editTrade(a,null,{side:{long:"Long",short:"Short",buy:"Buy",sell:"Sell"}[q]})});
 const ad=$("addtrade");if(ad)ad.onclick=()=>{txHold();editTrade(accs[0])};
 B.querySelectorAll(".txrow[data-id]").forEach(b=>b.onclick=()=>{txHold();editTrade(b.dataset.a,b.dataset.id)});
 const mt=$("moretr");if(mt)mt.onclick=()=>{S.ui.shown=(S.ui.shown||30)+30;txHold();renderTrades()}}
function txCenter(smooth=true){const w=$("txcards"),c=w&&w.querySelector(".txc.on");txProgUntil=Date.now()+(smooth&&!RM?900:120);if(c&&w.clientWidth)w.scrollTo({left:c.offsetLeft-(w.clientWidth-c.offsetWidth)/2,behavior:smooth&&!RM?"smooth":"auto"})}
function txHold(){txHeld=Date.now()+20000;const d=$("txdots");if(d)d.classList.add("held");txSchedule()}
function txSchedule(){clearTimeout(txTimer);if(RM)return;txTimer=setTimeout(txStep,Math.max(6000,txHeld-Date.now()))}
function txStep(){if(S.view!=="trades")return;
 if(txTouch||txHeld>Date.now()||document.hidden||!$("sheetwrap").hidden||RO||scrollY>160){txSchedule();return}
 const i=TSEC.findIndex(s=>s.k===S.ui.tsec);S.ui.tsec=TSEC[(i+1)%TSEC.length].k;txDay=null;S.ui.shown=30;const b=$("txbody");b.classList.add("swap");
 setTimeout(()=>{renderTrades();txCenter();const c=$("txcards").querySelector(".txc.on");if(c)c.classList.add("draw");b.classList.remove("swap")},200);txSchedule()}
// Card strip touch handling. A swipe ends with touchend OR touchcancel/pointercancel (Android cancels the pointer
// when the browser takes over scrolling), so all of them release the "finger down" state. Only scrolls that started
// with your finger can change the selected section; the app's own centering animation is ignored.
let txProgUntil=0,txUser=false,txLastScroll=0;
function txPaintCards(list){const w=$("txcards"),tmp=document.createElement("div");tmp.innerHTML=list.join("");const nb=[...tmp.children];
 if(w.children.length!==nb.length){w.innerHTML="";nb.forEach(b=>{b.addEventListener("click",function(){if(Date.now()-txLastScroll<250&&txUser)return;S.ui.tsec=this.dataset.s;S.ui.shown=30;txDay=null;txHold();save();renderTrades();txCenter()});w.appendChild(b)});return}
 [...w.children].forEach((el,i)=>{const b=nb[i];el.className=b.className;el.dataset.s=b.dataset.s;el.setAttribute("style",b.getAttribute("style")||"");el.setAttribute("aria-selected",b.classList.contains("on"));el.innerHTML=b.innerHTML})}
function txSettle(){const w=$("txcards");if(!w||!txUser||txTouch||Date.now()<txProgUntil)return;txUser=false;const mid=w.scrollLeft+w.clientWidth/2;let best=null,bd=1e9;
 w.querySelectorAll(".txc").forEach(c=>{const d=Math.abs(c.offsetLeft+c.offsetWidth/2-mid);if(d<bd){bd=d;best=c}});
 if(best&&best.dataset.s!==S.ui.tsec){S.ui.tsec=best.dataset.s;txDay=null;S.ui.shown=30;txHold();save();renderTrades()}else txHold()}
(function(){const w=$("txcards");if(!w)return;
 const down=()=>{txTouch=true;txUser=true;$("txdots").classList.add("paused")};
 const up=()=>{if(!txTouch)return;txTouch=false;$("txdots").classList.remove("paused");clearTimeout(txScrollT);txScrollT=setTimeout(txSettle,220)};
 w.addEventListener("touchstart",down,{passive:true});w.addEventListener("pointerdown",e=>{if(e.pointerType==="mouse")down()});
 for(const ev of ["touchend","touchcancel"])addEventListener(ev,up,{passive:true});for(const ev of ["pointerup","pointercancel"])addEventListener(ev,up);
 w.addEventListener("scroll",()=>{if(Date.now()<txProgUntil)return;txLastScroll=Date.now();clearTimeout(txScrollT);txScrollT=setTimeout(txSettle,180)},{passive:true});
 if("onscrollend" in w)w.addEventListener("scrollend",()=>{if(Date.now()<txProgUntil)return;clearTimeout(txScrollT);txSettle()});
 // touching anywhere on the Trades page means you're reading or about to scroll: don't rotate under your finger
 const pg=$("p-trades");if(pg)pg.addEventListener("touchstart",()=>{txHeld=Math.max(txHeld,Date.now()+8000)},{passive:true})})();
// + menu → Log a trade: pick the account, then its own form (won/lost, long/short or buy/sell)
function tradePicker(){const SEC_OF={poly:"poly",pred:"pred",cb:"deriv",fut:"deriv",dman:"deriv",spot:"spot",bob:"bob"},bgOf=a=>(TSEC.find(s=>s.k===SEC_OF[a])||TSEC[0]).bg;
 const sub={poly:"Won or lost",pred:"Won or lost",cb:"Long or short",fut:"Long or short",dman:"Long or short · your market",spot:"Buy or sell",bob:"Long or short"};
 openSheet(`<h2>Log a trade</h2><p class="desc">Which account?</p><div class="tpick">${Object.keys(ACCTS).map(a=>`<button class="tpk" data-a="${a}" style="--bgc:${bgOf(a)}"><b>${esc(a==="dman"?"Derivatives · Manual":a==="cb"?"Derivatives · Coinbase":a==="fut"?"Derivatives · Futures":ACCTS[a])}</b><small>${sub[a]}</small></button>`).join("")}</div>`,
 root=>root.querySelectorAll(".tpk").forEach(b=>b.onclick=()=>{const a=b.dataset.a;S.ui.tsec=SEC_OF[a];if(SEC_OF[a]==="deriv")S.ui.dsub=a;save();if(S.view!=="trades")go("trades");else renderTrades();editTrade(a)}))}function quickLog(win,el,a=txSec().accs()[0]){const stake=+S.settings.stake[a]||0,tf=a==="poly"?(S.ui.tf==="All"?"5m":S.ui.tf):"";
 const t={id:uid(),src:"manual",ts:Date.now(),title:S.settings.label[a]||ACCTS[a],tf,side:"",cost:stake,pnl:win?stake:-stake,res:win?"win":"loss",note:""};S.trades[a].push(t);addXP(5,el);save();renderTrades();renderCards();
 if(win)burst(el,["#86D3B0","#EFBC90","#F6E3CC"]);toast((win?"Win":"Loss")+" logged · "+pnlStr(t.pnl),"Edit",()=>editTrade(a,t.id))}

/* ================= Coinbase futures sync (read-only) =================
   Uses the user's own View-only CDP API key (key name + EC private key). The key is kept in its own
   localStorage slot on this phone only: it is never part of S, so it is not in backups or exports.
   Requests are signed with an ES256 JWT (per Coinbase's Advanced Trade docs) and sent through the native
   HTTP layer in the Fold app (a regular browser is blocked from calling Coinbase directly).
   Futures fills are paired first-in-first-out into closed trades; open positions come from the CFM endpoints. */
const CBK="oplock.cbkey";
const cbKey=()=>{try{const k=JSON.parse(localStorage.getItem(CBK)||"null");return k&&k.name&&k.pem?k:null}catch(e){return null}};
const b64u=b=>{let s="";for(const x of b)s+=String.fromCharCode(x);return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")};
function pemBytes(pem){const body=pem.replace(/\\n/g,"\n").replace(/-----[^-]+-----/g,"").replace(/\s+/g,"");const bin=atob(body);return Uint8Array.from(bin,c=>c.charCodeAt(0))}
function derItems(buf,start=0,end=buf.length){const out=[];let i=start;while(i<end){const tag=buf[i++];let len=buf[i++];if(len&0x80){const n=len&0x7f;len=0;for(let j=0;j<n;j++)len=len*256+buf[i++]}out.push({tag,start:i,len,bytes:buf.subarray(i,i+len)});i+=len}return out}
async function cbImportKey(pem){const der=pemBytes(pem),alg={name:"ECDSA",namedCurve:"P-256"};
 if(/BEGIN PRIVATE KEY/.test(pem))return crypto.subtle.importKey("pkcs8",der,alg,false,["sign"]);
 // SEC1 "EC PRIVATE KEY": SEQUENCE { version, OCTET STRING d, [0] curve, [1] BIT STRING public point }
 const seq=derItems(der)[0],items=derItems(der,seq.start,seq.start+seq.len),dI=items.find(x=>x.tag===0x04),pubT=items.find(x=>x.tag===0xa1);
 if(!dI||!pubT)throw new Error("That private key isn't in the expected format");
 let d=dI.bytes;if(d.length<32){const p=new Uint8Array(32);p.set(d,32-d.length);d=p}
 const pub=derItems(der,pubT.start,pubT.start+pubT.len)[0].bytes.subarray(1);if(pub[0]!==4||pub.length!==65)throw new Error("That private key isn't a P-256 (ES256) key");
 return crypto.subtle.importKey("jwk",{kty:"EC",crv:"P-256",d:b64u(d),x:b64u(pub.subarray(1,33)),y:b64u(pub.subarray(33,65)),ext:false},alg,false,["sign"])}
async function cbJWT(method,path,k){const key=await cbImportKey(k.pem),now=Math.floor(Date.now()/1000),te=new TextEncoder(),enc=o=>b64u(te.encode(JSON.stringify(o)));
 const nonce=[...crypto.getRandomValues(new Uint8Array(16))].map(b=>b.toString(16).padStart(2,"0")).join("");
 const data=enc({alg:"ES256",kid:k.name,nonce,typ:"JWT"})+"."+enc({sub:k.name,iss:"cdp",nbf:now,exp:now+120,uri:`${method} api.coinbase.com${path}`});
 return data+"."+b64u(new Uint8Array(await crypto.subtle.sign({name:"ECDSA",hash:"SHA-256"},key,te.encode(data))))}
async function cbGet(path,query="",k=cbKey()){if(!k)throw new Error("Coinbase isn't connected");const jwt=await cbJWT("GET",path,k);
 const r=await fetch("https://api.coinbase.com"+path+(query?"?"+query:""),{headers:{Authorization:"Bearer "+jwt,Accept:"application/json"},cache:"no-store"});
 if(!r.ok){let m="";try{const j=await r.json();m=j.message||j.error||""}catch(e){}throw new Error(r.status===401?"Coinbase didn't accept the key (401). Check the key name and private key.":`Coinbase answered ${r.status}${m?": "+m:""}`)}return r.json()}
const cbNum=x=>+(x&&typeof x==="object"&&"value" in x?x.value:x)||0;
function fifoTrips(fills,cs){const by={};[...fills].sort((a,b)=>Date.parse(a.trade_time)-Date.parse(b.trade_time)).forEach(f=>(by[f.product_id]=by[f.product_id]||[]).push(f));const trips=[];
 for(const [p,list] of Object.entries(by)){const mult=cs[p]||1,q=[];
  for(const f of list){const full=+f.size||0;if(!full)continue;let size=full;const price=+f.price||0,fee=+(f.commission||0),side=f.side;
   while(size>1e-12&&q.length&&q[0].side!==side){const lot=q[0],m=Math.min(size,lot.size),dir=lot.side==="BUY"?1:-1;
    const fees=lot.fee*(m/lot.size0)+fee*(m/full);
    trips.push({id:"cb:"+lot.id+":"+(f.entry_id||f.trade_id),product:p,side:lot.side==="BUY"?"Long":"Short",entry:lot.price,exit:price,size:m,pnl:(price-lot.price)*m*mult*dir-fees,ts:Date.parse(f.trade_time),known:!!cs[p]});
    lot.size-=m;size-=m;if(lot.size<=1e-12)q.shift()}
   if(size>1e-12)q.push({side,size,size0:size,price,fee:fee*(size/full),id:f.entry_id||f.trade_id})}}
 return trips}
let cbSyncing=false;
async function cbSync(manual){const k=cbKey();if(!k){if(manual)cbConnectSheet();return}
 if(!NATIVE){if(manual)toast("Coinbase sync runs in the Op-Lock In app on your Fold");return}if(cbSyncing)return;cbSyncing=true;renderSyncLine("Syncing Coinbase…");
 try{let fills=[],cursor="",pages=0;
  do{const q=new URLSearchParams({product_types:"FUTURE",limit:"250"});if(cursor)q.set("cursor",cursor);const j=await cbGet("/api/v3/brokerage/orders/historical/fills",q.toString());fills.push(...(j.fills||[]));cursor=j.cursor||"";pages++}while(cursor&&pages<8);
  fills=fills.filter(f=>!f.trade_type||f.trade_type==="FILL");
  const cs={};for(const p of [...new Set(fills.map(f=>f.product_id))]){try{const j=await cbGet("/api/v3/brokerage/products/"+p);cs[p]=+(j.future_product_details&&j.future_product_details.contract_size)||0}catch(e){cs[p]=0}}
  const trips=fifoTrips(fills,cs);let pos=[],bal=null;
  try{pos=(await cbGet("/api/v3/brokerage/cfm/positions")).positions||[]}catch(e){}
  try{bal=(await cbGet("/api/v3/brokerage/cfm/balance_summary")).balance_summary||null}catch(e){}
  const L=S.trades.cb;let added=0;
  const up=t=>{const ex=L.find(x=>x.id===t.id);if(!ex){L.push(t);added++}else if(!ex.edited)Object.assign(ex,t,{note:ex.note,hidden:ex.hidden})};
  for(const tr of trips)up({id:tr.id,src:"sync",ts:tr.ts,title:tr.product,side:tr.side,entry:+tr.entry.toFixed(6),exit:+tr.exit.toFixed(6),size:+tr.size.toFixed(6),venue:"Coinbase",pnl:Math.round(tr.pnl*100)/100,res:tr.pnl>=0?"win":"loss",estimate:!tr.known});
  const live=new Set();for(const p of pos){const n=cbNum(p.number_of_contracts);if(!n)continue;const id="cb:pos:"+p.product_id;live.add(id);
   up({id,src:"sync",ts:Date.now(),title:p.product_id,side:p.side==="SHORT"?"Short":"Long",entry:cbNum(p.avg_entry_price),exit:null,size:n,venue:"Coinbase",pnl:0,res:"open",upnl:Math.round(cbNum(p.unrealized_pnl)*100)/100})}
  S.trades.cb=L.filter(t=>!(String(t.id).startsWith("cb:pos:")&&!live.has(t.id)));
  S.cbsync={last:Date.now(),err:"",bal:bal?cbNum(bal.cfm_usd_balance||bal.total_usd_balance):null,upnl:bal?cbNum(bal.unrealized_pnl):null,today:bal?cbNum(bal.daily_realized_pnl):null};save();renderTrades();renderCards();
  if(manual||added)toast(added?`Coinbase · ${added} new trade${added>1?"s":""}`:"Coinbase synced · nothing new")}
 catch(e){S.cbsync={...(S.cbsync||{}),err:e.message||"Couldn't reach Coinbase"};save();if(manual)toast(S.cbsync.err)}
 finally{cbSyncing=false;renderSyncLine()}}
function cbConnectSheet(){const k=cbKey();
 openSheet(`<h2>${k?"Coinbase is connected":"Connect Coinbase"}</h2><p class="desc">Read-only. Op-Lock In can see your futures trades and positions, but it can never place a trade or move money. The key stays on this phone only and isn't included in backups.</p>
 ${NATIVE?"":`<div class="note">Open Op-Lock In on your Fold to connect. A regular browser isn't allowed to talk to Coinbase directly.</div>`}
 ${k?`<p class="desc">Key: <b>${esc(k.name.replace(/^organizations\/[^/]+\/apiKeys\//,"…/"))}</b>${S.cbsync&&S.cbsync.last?` · last synced ${ago(S.cbsync.last)}`:""}</p>
  <div class="btns"><button class="action p" id="cb-sync">Sync now</button><button class="action danger" id="cb-off">Disconnect</button></div>`
 :`<div class="note phase"><b>How to get a View-only key</b>1. In a browser, go to portal.cdp.coinbase.com and open API Keys.\n2. Create an API key. Give it a name and choose View only (leave Trade and Transfer off).\n3. Copy the API key name (it starts with organizations/…) and the private key (it starts with -----BEGIN EC PRIVATE KEY-----).\n4. Paste both here. Don't paste them anywhere else, and don't share them in a chat.</div>
  <div class="field"><label for="cb-name">API key name</label><input id="cb-name" placeholder="organizations/…/apiKeys/…" autocomplete="off" autocapitalize="off" spellcheck="false"></div>
  <div class="field"><label for="cb-pem">Private key</label><textarea id="cb-pem" style="min-height:120px;font-family:ui-monospace,monospace;font-size:12px" placeholder="-----BEGIN EC PRIVATE KEY-----" autocomplete="off" autocapitalize="off" spellcheck="false"></textarea></div>
  <div class="btns"><button class="action p" id="cb-save" ${NATIVE?"":"disabled"}>Check and connect</button></div><div id="cb-msg"></div>`}`,
 root=>{const q=s=>root.querySelector(s),msg=t=>{const m=q("#cb-msg");if(m)m.innerHTML=`<div class="confirm">${esc(t)}</div>`};
  const sv=q("#cb-save");if(sv)sv.onclick=async()=>{const k2={name:q("#cb-name").value.trim(),pem:q("#cb-pem").value.trim()};
   if(!/^organizations\/.+\/apiKeys\/.+/.test(k2.name)){msg("The key name should look like organizations/…/apiKeys/…");return}
   if(!/BEGIN (EC )?PRIVATE KEY/.test(k2.pem)){msg("Paste the whole private key, including the BEGIN and END lines.");return}
   sv.disabled=true;sv.textContent="Checking…";
   try{await cbImportKey(k2.pem);const p=await cbGet("/api/v3/brokerage/key_permissions","",k2);
    if(p.can_trade||p.can_transfer){msg("This key can "+(p.can_transfer?"move money":"place trades")+". For safety, make a View-only key and paste that one instead. Nothing was saved.");return}
    if(p.can_view===false){msg("This key can't view your account. Make sure View is turned on.");return}
    localStorage.setItem(CBK,JSON.stringify(k2));closeSheet();toast("Coinbase connected · syncing");S.ui.tsec="deriv";S.ui.dsub="cb";save();renderTrades();cbSync(true)}
   catch(e){msg(e.message||"Couldn't check the key")}finally{sv.disabled=false;sv.textContent="Check and connect"}};
  const sy=q("#cb-sync");if(sy)sy.onclick=()=>{closeSheet();cbSync(true)};
  const off=q("#cb-off");if(off)off.onclick=()=>{if(!off.dataset.sure){off.dataset.sure=1;off.textContent="Tap again to disconnect";return}
   localStorage.removeItem(CBK);closeSheet();renderTrades();toast("Coinbase disconnected. Synced trades stay; delete the key on Coinbase too if you like.")}})}

/* ================= sheet ================= */
function closeSheet(){const w=$("sheetwrap");if(w.hidden)return;w.hidden=true;$("sheet").innerHTML="";$("sheet").style.transform="";delete $("sheet").dataset.kind}
/* ===== Getting out of things: one stack of open layers (page, sheet, + menu, calm mode).
   Each open layer adds a browser history entry, so Android's back gesture, the browser back button
   and Esc all close the top layer first, then return to Home. Layers are detected by watching the DOM,
   so every way of opening a sheet is covered. ===== */
const LAYERS=[];let popSkip=0;
function layerOpen(name,close){if(LAYERS.some(l=>l.name===name))return;LAYERS.push({name,close});try{history.pushState({layer:name},"")}catch(e){}}
function layerClosed(name){const i=LAYERS.map(l=>l.name).lastIndexOf(name);if(i<0)return;LAYERS.splice(i,1);popSkip++;try{history.back()}catch(e){popSkip--}}
function closeTopLayer(){if(LAYERS.length)history.back()}
addEventListener("popstate",()=>{if(popSkip>0){popSkip--;return}const l=LAYERS.pop();if(l)l.close()});
const watchLayer=(node,name,isOpen,close)=>{if(!node)return;let was=isOpen();new MutationObserver(()=>{const now=isOpen();if(now===was)return;was=now;now?layerOpen(name,close):layerClosed(name)}).observe(node,{attributes:true,attributeFilter:["hidden","class"]})};
watchLayer($("sheetwrap"),"sheet",()=>!$("sheetwrap").hidden,closeSheet);
watchLayer($("calm"),"calm",()=>!$("calm").hidden,()=>closeCalm(null));
watchLayer($("qlog"),"qlog",()=>$("qlog").classList.contains("open"),()=>qlog(false));
watchLayer($("troom"),"room",()=>$("troom").classList.contains("on"),()=>closeRoom());
// after editing a task from inside the task room, refresh the room
new MutationObserver(()=>{if($("sheetwrap").hidden&&RO)drawRoom()}).observe($("sheetwrap"),{attributes:true,attributeFilter:["hidden"]});
// Native back gesture on the Fold (needs @capacitor/app in the APK): close the top layer, else go Home, else leave the app.
(function(){const A=window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform()&&window.Capacitor.Plugins&&window.Capacitor.Plugins.App;if(!A||!A.addListener)return;
 A.addListener("backButton",()=>{if(LAYERS.length)closeTopLayer();else if(S.view!=="home")go("home");else A.minimizeApp?A.minimizeApp():A.exitApp()})})();
// Tap the dark area around a sheet to close it (only if the press started there too, so drags and text selection don't close it by accident).
let sheetDown=null;$("sheetwrap").addEventListener("pointerdown",e=>{sheetDown=e.target===$("sheetwrap")});
$("sheetwrap").addEventListener("click",e=>{if(e.target===$("sheetwrap")&&sheetDown!==false)closeSheet();sheetDown=null});
addEventListener("keydown",e=>{if(e.key!=="Escape")return;if(!$("calm").hidden)return closeCalm(null);if(!$("sheetwrap").hidden)return closeSheet();if($("troom").classList.contains("on"))return closeRoom();qlog(false);orbit(false);if(typeof hideNote==="function")hideNote();if(typeof mHideTip==="function")mHideTip()});
// Every sheet gets an × in the corner, however it was opened.
new MutationObserver(()=>{const s=$("sheet");if(!s.firstElementChild||s.querySelector(":scope>.sheetx"))return;const b=document.createElement("button");b.className="sheetx";b.type="button";b.setAttribute("aria-label","Close");b.innerHTML='<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>';b.onclick=closeSheet;s.prepend(b)}).observe($("sheet"),{childList:true});
// Swipe a sheet down by its top edge to close it.
(function(){const s=$("sheet");let y0=null,dy=0;
 s.addEventListener("pointerdown",e=>{if(e.target.closest("input,textarea,select,button,a,[contenteditable]"))return;const r=s.getBoundingClientRect();if(e.clientY-r.top>56||s.scrollTop>0)return;y0=e.clientY;dy=0;s.style.transition="none";try{s.setPointerCapture(e.pointerId)}catch(_){}});
 s.addEventListener("pointermove",e=>{if(y0===null)return;dy=Math.max(0,e.clientY-y0);s.style.transform=`translateY(${dy}px)`});
 const end=()=>{if(y0===null)return;y0=null;s.style.transition="transform .3s cubic-bezier(.32,.72,0,1)";if(dy>90){s.style.transform="translateY(110%)";setTimeout(closeSheet,220)}else s.style.transform="";dy=0};
 s.addEventListener("pointerup",end);s.addEventListener("pointercancel",end)})();
function openSheet(html,bind){delete $("sheet").dataset.kind;$("sheet").innerHTML=`<div class="grab"></div>`+html;$("sheetwrap").hidden=false;bind($("sheet"));const f=$("sheet").querySelector("input:not([type=checkbox]),textarea");if(f&&matchMedia("(hover:hover)").matches)f.focus()}
function opts(name,list,val,cls=""){return `<div class="opts ${cls}" data-name="${name}">${list.map(([v,l,ic])=>`<button type="button" data-v="${esc(v)}" class="${v===val?"on":""}">${ic?`<i aria-hidden="true">${ic}</i>`:""}${esc(l)}</button>`).join("")}</div>`}
function bindOpts(root,onChange){root.querySelectorAll(".opts").forEach(g=>g.querySelectorAll("button").forEach(b=>b.onclick=()=>{g.querySelectorAll("button").forEach(x=>x.classList.toggle("on",x===b));onChange&&onChange(g.dataset.name,b.dataset.v)}))}
const optVal=(root,name)=>root.querySelector(`.opts[data-name="${name}"] .on`)?.dataset.v;
const toLocalInput=ts=>{const d=new Date(ts);d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,16)};

// one form per kind of ledger: won/lost (Polymarket, Prediction), long/short (Coinbase, Futures, Bob), buy/sell (Spot)
function editTrade(a,id,preset={}){const k=TKIND[a]||"wl",isNew=!id,stake=+S.settings.stake[a]||0;
 const base={id:uid(),src:"manual",ts:Date.now(),title:k==="wl"?(S.settings.label[a]||ACCTS[a]):"",tf:a==="poly"?(S.ui.tf==="All"?"5m":S.ui.tf):"",side:"",cost:k==="wl"?stake:"",pnl:k==="wl"?stake:"",res:k==="wl"?"win":"open",note:""};
 const t=isNew?{...base,...preset}:(S.trades[a]||[]).find(x=>x.id===id);if(!t)return;
 const v=x=>x===undefined||x===null?"":esc(String(x)),num=(id,lab,val,ph="")=>`<div class="field"><label for="${id}">${lab}</label><input id="${id}" type="number" inputmode="decimal" step="any" value="${v(val)}" placeholder="${ph}"></div>`;
 const title=isNew?(k==="bs"?(t.side==="Sell"?"Log a sale":"Log a buy"):k==="ls"?`New ${(t.side||"").toLowerCase()} position`.replace("  "," "):"Add a trade"):"Edit trade";
 let body="";
 if(k==="wl")body=`<div class="field"><label>Result</label>${opts("res",[["win","Won"],["loss","Lost"],["open","Still open"]],t.res,"wl")}</div>
  <div class="pair">${num("f-cost","Amount in ($)",+t.cost||0)}${num("f-pnl","Profit or loss ($)",+t.pnl||0)}</div>
  ${a==="poly"?`<div class="field"><label>Timeframe</label>${opts("tf",[["5m","5m"],["15m","15m"],["1h","1h"],["Other","Other"]],["5m","15m","1h"].includes(t.tf)?t.tf:"Other")}</div>`:""}
  <div class="field"><label>Side</label>${opts("side",a==="poly"?[["Up","Up"],["Down","Down"],["","None"]]:[["Yes","Yes"],["No","No"],["","None"]],t.side||"")}</div>
  <div class="field"><label for="f-title">Market</label><input id="f-title" value="${v(t.title)}" placeholder="${a==="pred"?"Fed cuts in December":"BTC Up/Down"}" autocomplete="off"></div>`;
 if(k==="ls")body=`<div class="field"><label>Side</label>${opts("side",[["Long","Long"],["Short","Short"]],t.side||"Long","wl")}</div>
  ${a==="fut"?`<div class="field"><label>Market</label>${opts("venue",[["Liquid Brokers","Liquid Brokers"],["THTrader","THTrader"],["Other","Other"]],t.venue||"Liquid Brokers")}</div>`:""}
  ${a==="dman"?`<div class="field"><label for="f-venue">Market or exchange</label><input id="f-venue" value="${v(t.venue)}" placeholder="Bybit, Kraken, your broker…" autocomplete="off"></div>`:""}
  <div class="field"><label for="f-title">${a==="fut"?"Contract":"Instrument"}</label><input id="f-title" value="${v(t.title)}" placeholder="${a==="fut"?"ES, NQ, CL…":"BTC-PERP"}" autocomplete="off"></div>
  <div class="pair">${num("f-entry","Entry price",t.entry)}${num("f-exit","Exit price",t.exit,"Still open")}</div>
  <div class="pair">${num("f-size",a==="fut"?"Contracts":"Size",t.size,a==="fut"?"1":"0.01")}${num("f-lev","Leverage (x)",t.lev,"optional")}</div>
  <div class="pair">${num("f-pnl","Profit or loss ($)",t.res==="open"?"":t.pnl,"auto from prices")}${num("f-cost","Margin ($)",t.cost,"optional")}</div>
  <p class="desc">Leave profit or loss empty and it's worked out from entry, exit and size${a==="fut"?" (for futures, enter it yourself so the contract multiplier is right)":""}. No exit means the position is still open.</p>`;
 if(k==="bs")body=`<div class="field"><label>Side</label>${opts("side",[["Buy","Buy"],["Sell","Sell"]],t.side||"Buy","wl")}</div>
  <div class="field"><label for="f-title">Asset</label><input id="f-title" value="${v(t.title)}" placeholder="BTC" autocomplete="off" style="text-transform:uppercase"></div>
  <div class="pair">${num("f-qty","Quantity",t.qty,"0.05")}${num("f-price","Price ($)",t.price,"81,200")}</div>
  <div class="field" id="f-pnlwrap" ${t.side==="Sell"?"":"hidden"}>${num("f-pnl","Profit or loss on this sale ($)",t.res==="open"?"":t.pnl,"optional")}</div>`;
 openSheet(`<h2>${title}</h2><p class="desc">${ACCTS[a]}${t.src==="sync"?" · synced. Your changes stay after the next sync.":""}</p>${body}
  <div class="field"><label for="f-ts">When</label><input id="f-ts" type="datetime-local" value="${toLocalInput(t.ts)}"></div>
  <div class="field"><label for="f-note">Note</label><textarea id="f-note" style="min-height:80px" placeholder="Why you took it, what you learned">${esc(t.note||"")}</textarea></div>
  <div class="btns"><button class="action p" id="f-save">${isNew?"Save trade":"Save changes"}</button>${isNew?"":`<button class="action danger" id="f-del">Delete</button>`}</div><div id="f-conf"></div>`,
 root=>{const q=s=>root.querySelector(s),nv=s=>{const x=q(s);return x&&x.value!==""?+x.value:null};
  bindOpts(root,(n,val)=>{if(k==="wl"&&n==="res"){const p=q("#f-pnl"),c=+q("#f-cost").value||0;let x=+p.value||0;if(val==="win"&&x<=0)x=Math.abs(x)||c;if(val==="loss"&&x>=0)x=-(Math.abs(x)||c);if(val==="open")x=0;p.value=x}
   if(k==="bs"&&n==="side")q("#f-pnlwrap").hidden=val!=="Sell"});
  q("#f-save").onclick=()=>{const common={ts:new Date(q("#f-ts").value).getTime()||t.ts,note:q("#f-note").value.trim()};
   if(k==="wl"){const res=optVal(root,"res");let pnl=+q("#f-pnl").value||0;if(res==="loss"&&pnl>0)pnl=-pnl;if(res==="win"&&pnl<0)pnl=-pnl;
    Object.assign(t,common,{res,pnl:Math.round(pnl*100)/100,cost:+q("#f-cost").value||0,tf:a==="poly"?optVal(root,"tf"):(t.tf||""),side:optVal(root,"side"),title:q("#f-title").value.trim()||S.settings.label[a]||ACCTS[a]})}
   if(k==="ls"){const side=optVal(root,"side"),entry=nv("#f-entry"),exit=nv("#f-exit"),size=nv("#f-size");let pnl=nv("#f-pnl");
    if(pnl===null&&entry!==null&&exit!==null&&size!==null)pnl=(side==="Short"?entry-exit:exit-entry)*size;const closed=exit!==null||pnl!==null;
    if(!q("#f-title").value.trim()){toast("Add the instrument, like BTC-PERP");return}
    Object.assign(t,common,{side,venue:a==="fut"?optVal(root,"venue"):a==="dman"?q("#f-venue").value.trim():a==="cb"?"Coinbase":a==="bob"?"Pionex":"",title:q("#f-title").value.trim().toUpperCase(),entry,exit,size,lev:nv("#f-lev"),cost:nv("#f-cost")||0,
     pnl:closed?Math.round((pnl||0)*100)/100:0,res:closed?((pnl||0)>=0?"win":"loss"):"open"})}
   if(k==="bs"){const side=optVal(root,"side"),qty=nv("#f-qty"),price=nv("#f-price"),pnl=side==="Sell"?nv("#f-pnl"):null;
    if(!q("#f-title").value.trim()||!qty){toast("Add the asset and quantity");return}
    Object.assign(t,common,{side,title:q("#f-title").value.trim().toUpperCase(),qty,price:price||0,cost:Math.round(qty*(price||0)*100)/100,pnl:pnl===null?0:Math.round(pnl*100)/100,res:pnl===null?"open":pnl>=0?"win":"loss"})}
   if(t.src==="sync")t.edited=true;if(isNew){S.trades[a].push(t);addXP(5)}save();closeSheet();renderTrades();renderCards();toast(isNew?"Trade saved":"Trade updated")};
  const del=q("#f-del");if(del)del.onclick=()=>{if(!del.dataset.sure){del.dataset.sure=1;del.textContent="Tap again to delete";q("#f-conf").innerHTML=`<div class="confirm">${t.src==="sync"?"This hides the trade. It won't come back on the next sync. You can restore hidden trades in Settings.":"This removes the trade for good."}</div>`;return}
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
let doNextId=null,DN=null;
function renderToday(just){const k=dkey(),dd=dayData(k),tl=timing(k),req=tl.filter(t=>!t.optional),left=req.filter(t=>!dd.done[t.id]),info=nextInfo(),nMiss=info.missed.length;
 $("prog").textContent=(req.length-left.length)+" of "+req.length;DN=DN||$("donext");if($("donelbl"))$("donelbl").textContent=(req.length-left.length)+" of "+req.length+" done";const bd=$("dbadge");bd.hidden=!left.length;bd.textContent=left.length;
 doNextId=info.t?info.t.id:null;
 $("dnt").textContent=info.t?info.t.t:tl.length?"All clear for today":"Add your first task";
 $("dncount").textContent=info.kind==="now"?"Now":info.kind==="soon"?"Starting soon":info.kind==="missed"?"Catch up":info.kind==="any"?"Anytime today":info.kind==="up"?"Up next":"All done";
 $("dncount").className="eyebrow"+(info.kind==="now"?" nowchip":info.kind==="missed"?" misschip":"");
 $("dnsub").textContent=info.t?info.sub+(info.then?` Then: ${info.then.t} at ${info.then.time}.`:"")+(nMiss&&info.kind!=="missed"?` ${nMiss} missed today.`:""):tl.length?"Everything's done. Your streak is safe.":"Use the box below to build your routine.";
 $("dnxp").textContent=`Level ${level()} · ${S.xp%1000} XP`;$("dndone").hidden=$("dnskip").hidden=!info.t;
 const firstUp=tl.filter(t=>t.st==="upcoming").sort((a,b)=>a.T-b.T)[0],nm=nowMin();
 const pm=pastMissed();
 const byDay={};pm.forEach(t=>(byDay[t.k]=byDay[t.k]||[]).push(t));
 const missedHtml=pm.length?`<details class="missedbox" ${S.ui.missOpen?"open":""}><summary>Missed earlier · ${pm.length}</summary><p class="sub" style="margin:6px 0 4px">Check off anything you actually did. Finishing a day's list repairs its streak. Dismiss a day to clear the rest.</p>
  ${Object.entries(byDay).map(([dk,items])=>`<div class="row sb missday"><b>${esc(items[0].when)} · ${items.length} missed</b><button class="link" data-ack="${dk}">Dismiss</button></div>${items.map(t=>`<div class="it"><button class="main" data-past="${t.k}|${t.id}"><span class="ck"></span><span class="t">${esc(t.t)}</span></button><span class="r">${esc(t.time||"")}</span></div>`).join("")}`).join("")}</details>`:"";
 let g="";const tm=s=>s?esc(s).replace(/\s?(AM|PM)$/i,m=>`<small>${m.trim().toLowerCase()}</small>`):"";
 const html=tl.map(t=>{const done=t.st==="done"||t.st==="late";
  const head=t.g!==g?(g=t.g,`<div class="tlg">${esc(g)}</div>`):"";
  if(t.id===doNextId)return head+`<div class="tlnow" id="nowslot"></div>`;
  const tag=t.st==="now"?'<span class="mtag nowt">Now</span>':t.st==="missed"?'<span class="mtag">Missed · tap to do</span>':firstUp&&t.id===firstUp.id?`<span class="mtag nextt">in ${fmtIn(t.T-nm)}</span>`:"";
  const meta=[t.st==="late"?"done late":"",t.steps&&t.steps.length?stepsDone(k,t)+"/"+stepList(k,t).length+(useAlt(k,t)?" gym":" steps"):"",t.optional?"optional":"",t.note&&!(t.steps&&t.steps.length)?"note":""].filter(Boolean).join(" · ");
  return head+`<div class="tlr ${done?"done":""} ${t.st==="missed"?"miss":""} ${t.st==="now"?"current":""} ${t.time?"":"untimed"} ${t.id===just?"just":""}"><span class="tm">${tm(t.time)}</span><button class="main" data-id="${t.id}"><span class="dot"></span><span class="t">${esc(t.t)}</span>${tag}</button>${meta?`<span class="r">${esc(meta)}</span>`:""}<button class="ed" data-ed="${t.id}" aria-label="Edit task">✎</button></div>`}).join("");
 $("tasks").innerHTML=missedHtml+(doNextId?"":`<div class="tlnow" id="nowslot"></div>`)+(html||`<div class="empty"><b>Build your daily routine</b>Add the things you do every day. They'll come back each morning.</div>`);
 const slot=$("nowslot");if(slot&&DN)slot.appendChild(DN);
 const mb=$("tasks").querySelector(".missedbox");if(mb)mb.ontoggle=()=>{S.ui.missOpen=mb.open;save()};
 $("tasks").querySelectorAll("[data-past]").forEach(b=>b.onclick=()=>{const [pk,id]=b.dataset.past.split("|");toggleTask(id,b,pk)});
 $("tasks").querySelectorAll("[data-ack]").forEach(b=>b.onclick=()=>{const dk=b.dataset.ack;dayData(dk).ack=true;save();renderToday();toast("Cleared. Those stay marked as missed.","Undo",()=>{delete dayData(dk).ack;save();renderToday()})});
 $("tasks").querySelectorAll(".main[data-id]").forEach(b=>b.onclick=()=>{const t=tl.find(x=>x.id===b.dataset.id);if(t&&t.link==="weigh"&&!dd.done[t.id])weighSheet(t.id);else if(t&&t.link==="water")openWater(b.closest(".tlr")||b);else if(t&&t.link==="dogs"&&!dd.done[t.id])dogCheckIn();else if(t&&((t.steps&&t.steps.length)||t.note||t.link))openSteps(t.id);else toggleTask(b.dataset.id,b)});$("tasks").querySelectorAll("[data-ed]").forEach(b=>b.onclick=()=>editTask(b.dataset.ed));
 $("streaklbl").textContent=streak()+(streak()===1?" day":" days");renderFoodBar()}
function toggleTask(id,el,k=dkey()){const dd=dayData(k);dd.done[id]=!dd.done[id];if(!dd.done[id])delete dd.done[id];addXP(dd.done[id]?10:-10,el);
 dd.doneAt=dd.doneAt||{};dd.late=dd.late||{};if(dd.done[id]){dd.doneAt[id]=Date.now();if(k!==dkey())dd.late[id]="late"}else{delete dd.doneAt[id];delete dd.late[id]}
 const rt=S.routine.find(r=>r.id===id);if(rt&&rt.link==="freezer"&&S.dogs&&k===dkey()){S.dogs.freezer=Math.max(0,(S.dogs.freezer||0)+(dd.done[id]?-1:1))}
 const was=dd.complete;dd.complete=isComplete(k);const s=streak();if(s>S.best)S.best=s;
 if(dd.complete&&!was)earnOnce(50,k===dkey()?"Cleared today":"Cleared "+new Date(k+"T12:00").toLocaleDateString([], {weekday:"long"}),"day:"+k);else if(!dd.complete&&was)unearn(50,"Day no longer cleared","day:"+k);checkMilestones();save();renderToday(dd.done[id]&&k===dkey()?id:null);renderWeek();renderCards();
 if(k!==dkey()){toast(dd.complete&&!was?"That day is complete now. Streak: "+s+" days.":dd.done[id]?"Checked off (done late)":"Unchecked");return}
 if(dd.complete&&!was){toast("Day cleared. "+s+"-day streak.");burst(el)}else if(dd.done[id])toast("+10 XP")}
const GICON={Morning:"🌅",Afternoon:"☀️",Evening:"🌙","Hair care":"💈",Weekly:"📅",Anytime:"⏳"};
// a row of quick times around the current one (or sensible defaults), plus "None"; the text box below still takes any time
function timeChips(cur){const m=tmin(cur||"");const list=m<9998?[m-30,m,m+30].map(fmtMin):["7:00 AM","12:00 PM","6:00 PM"];
 return`<div class="opts tchips" data-name="tq">${[...list,""].map(v=>`<button type="button" data-v="${esc(v)}" class="${(cur||"")===v?"on":""}">${v?esc(v.replace(":00 "," ")):"None"}</button>`).join("")}</div>`}
function bindTimeChips(root,sel){const inp=root.querySelector(sel),g=root.querySelector(".tchips");if(!g||!inp)return;
 g.querySelectorAll("button").forEach(b=>b.onclick=()=>{g.querySelectorAll("button").forEach(x=>x.classList.toggle("on",x===b));inp.value=b.dataset.v});
 inp.addEventListener("input",()=>g.querySelectorAll("button").forEach(x=>x.classList.toggle("on",x.dataset.v===inp.value.trim())))}
function editTask(id){const k=dkey(),r=S.routine.find(x=>x.id===id),ex=dayData(k).extra.find(x=>x.id===id),t=r||ex;if(!t)return;
 const weekly=!!(r&&r.dow&&r.dow.length&&r.dow.length<7),sel=new Set(weekly?r.dow:[dowOf(k)]);
 openSheet(`<h2>Edit task</h2><p class="desc">${r?(weekly?"Repeats on "+esc(repLabel(r))+".":"Part of your daily routine."):"Today only."}</p>
 <div class="field"><label for="t-t">Task</label><input id="t-t" value="${esc(t.t)}" autocomplete="off"></div>
 <div class="field"><label>Part of the day</label>${opts("g",GROUPS.map(x=>[x,x,GICON[x]||"•"]),t.g||"Anytime","tiles g3")}</div>
 <div class="field"><label for="t-time">Time</label>${timeChips(t.time)}<input id="t-time" value="${esc(t.time||"")}" placeholder="Or type a time, like 6:30 AM" autocomplete="off"></div>
 <div class="field"><label>Repeat</label>${opts("rep",[["daily","Every day"],["weekly","Certain days"],["once","Today only"]],r?(weekly?"weekly":"daily"):"once")}</div>
 <div class="field" id="t-days" ${weekly?"":"hidden"}><div class="opts days dots">${DOW.map((d,i)=>`<button type="button" data-d="${i}" class="${sel.has(i)?"on":""}" aria-label="${d}">${d[0]}</button>`).join("")}</div><span class="hint" id="t-dayh"></span></div>
 <button type="button" class="tog ${t.optional?"on":""}" id="t-opt" aria-pressed="${!!t.optional}"><span>Optional<small>Doesn't count toward your streak</small></span><i></i></button>
 <div class="field" id="t-stepsf" ${(t.steps||[]).length?"":"hidden"}><label for="t-steps">Checklist steps · one per line</label><textarea id="t-steps" style="min-height:110px" placeholder="Wash with shampoo&#10;Apply conditioner">${esc((t.steps||[]).join("\n"))}</textarea></div>
 <div class="field" id="t-notef" ${t.note?"":"hidden"}><label for="t-note">Note</label><textarea id="t-note" style="min-height:70px">${esc(t.note||"")}</textarea></div>
 <div class="addrow">${(t.steps||[]).length?"":`<button type="button" class="addl" data-show="t-stepsf">+ Checklist steps</button>`}${t.note?"":`<button type="button" class="addl" data-show="t-notef">+ Note</button>`}</div>
 <div class="btns"><button class="action p" id="t-save">Save</button><button class="action danger" id="t-del">${r?"Remove from routine":"Delete"}</button></div>`,
 root=>{bindOpts(root,(n,v)=>{if(n==="rep")root.querySelector("#t-days").hidden=v!=="weekly"});
  const dayH=()=>{const on=[...root.querySelectorAll(".days button.on")].map(b=>+b.dataset.d),h=root.querySelector("#t-dayh");h.textContent=on.length===7?"Every day":on.length===5&&!on.includes(0)&&!on.includes(6)?"Weekdays":on.length===2&&on.includes(0)&&on.includes(6)?"Weekends":on.length?on.length+(on.length===1?" day":" days")+" a week":"Pick at least one day"};dayH();
  root.querySelectorAll(".days button").forEach(b=>b.onclick=()=>{b.classList.toggle("on");dayH()});
  bindTimeChips(root,"#t-time");const og=root.querySelector("#t-opt");og.onclick=()=>{og.classList.toggle("on");og.setAttribute("aria-pressed",og.classList.contains("on"))};
  root.querySelectorAll("[data-show]").forEach(b=>b.onclick=()=>{const f=root.querySelector("#"+b.dataset.show);f.hidden=false;b.remove();const ta=f.querySelector("textarea");if(ta)ta.focus()});
  root.querySelector("#t-save").onclick=()=>{const nt={...t,id:t.id,t:root.querySelector("#t-t").value.trim()||t.t,time:root.querySelector("#t-time").value.trim(),g:optVal(root,"g")};const rep=optVal(root,"rep");
   for(const f of ["dow","steps","note","optional","rep"])delete nt[f];
   const steps=root.querySelector("#t-steps").value.split("\n").map(x=>x.trim()).filter(Boolean),note=root.querySelector("#t-note").value.trim();if(steps.length)nt.steps=steps;if(note)nt.note=note;if(root.querySelector("#t-opt").classList.contains("on"))nt.optional=true;
   const days=[...root.querySelectorAll(".days button.on")].map(b=>+b.dataset.d);if(rep==="weekly"){if(!days.length){toast("Pick at least one day");return}if(days.length<7)nt.dow=days}
   S.routine=S.routine.filter(x=>x.id!==id);const dd=dayData(k);dd.extra=dd.extra.filter(x=>x.id!==id);if(rep==="once")dd.extra.push(nt);else S.routine.push(nt);save();closeSheet();renderToday();renderWeek();renderCards();toast("Task saved")};
  root.querySelector("#t-del").onclick=()=>{S.routine=S.routine.filter(x=>x.id!==id);const dd=dayData(k);dd.extra=dd.extra.filter(x=>x.id!==id);delete dd.done[id];save();closeSheet();renderToday();renderWeek();renderCards();toast("Task removed")}})}
$("addf").onsubmit=e=>{e.preventDefault();const v=$("nt").value.trim();if(!v)return;const rep=$("rep").value,wd=dowOf(dkey()),t={id:uid(),t:v,time:"",g:rep==="weekly"?"Weekly":"Anytime"};
 if(rep==="once")dayData(dkey()).extra.push(t);else{if(rep==="weekly")t.dow=[wd];S.routine.push(t)}
 const dd=dayData(dkey());dd.complete=isComplete(dkey());$("nt").value="";save();renderToday();renderWeek();renderCards();toast(rep==="daily"?"Added to your routine":rep==="weekly"?"Added for every "+DOWL[wd].slice(0,-1):"Added for today")};
function syncRepSelect(){const o=$("rep").querySelector('[value=weekly]');if(o)o.textContent="Every "+DOWL[dowOf(dkey())].slice(0,-1)}
function dnDo(el){const k=dkey(),t=tasksFor(k).find(x=>x.id===doNextId);if(!t)return;if(t.link==="water")return openWater($("donext"));if(t.link==="dogs")return dogCheckIn();if(t.link==="weigh")weighSheet(t.id);else if(t.steps&&t.steps.length)openSteps(t.id);else toggleTask(t.id,el)}
// Slide to mark done: drag the knob past ~80% of the track. Keyboard users press the knob.
(function(){const tr=$("dndone"),kn=$("dnknob");if(!tr||!kn)return;let sx=0,dx=0,max=0,drag=false;
 const set=(x,anim)=>{tr.classList.toggle("anim",!!anim);tr.style.setProperty("--x",x+"px");tr.style.setProperty("--p",max?(x/max).toFixed(3):0)};
 kn.addEventListener("pointerdown",e=>{drag=true;sx=e.clientX;dx=0;max=tr.clientWidth-kn.offsetWidth-10;try{kn.setPointerCapture(e.pointerId)}catch(_){}set(0)});
 kn.addEventListener("pointermove",e=>{if(!drag)return;dx=Math.max(0,Math.min(max,e.clientX-sx));set(dx)});
 const end=()=>{if(!drag)return;drag=false;
  if(dx>=max*.8){set(max,true);try{navigator.vibrate&&navigator.vibrate(15)}catch(_){}setTimeout(()=>{dnDo(kn);set(0)},260)}
  else{set(0,true);if(dx<6){tr.classList.remove("nudge");void tr.offsetWidth;tr.classList.add("nudge")}}};
 kn.addEventListener("pointerup",end);kn.addEventListener("pointercancel",end);
 kn.addEventListener("click",e=>{if(e.detail===0)dnDo(kn)})})();
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
 ${k==="emotions"?`<div class="field"><label>How do you feel?</label>${opts("mood",MOODS.map((m,i)=>[String(i),m,["😞","😕","😐","🙂","😄"][i]]),String(e.mood??2),"tiles")}</div>`:""}
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
 const hist=Object.entries(S.weights||{}).filter(([d])=>d<k).sort((a,b)=>a[0]<b[0]?-1:1).slice(-7),prev=hist.length?hist[hist.length-1][1]:null;
 let val=+(cur??prev??148);
 const spark=()=>{const pts=[...hist.map(([d,v])=>[d,v]),[k,val]];if(pts.length<2)return`<p class="hint" style="text-align:center">Your 7-day chart starts after a couple of weigh-ins.</p>`;
  const vs=pts.map(p=>p[1]),mn=Math.min(...vs)-.3,mx=Math.max(...vs)+.3,X=i=>8+i*(284/Math.max(1,pts.length-1)),Y=v=>62-(v-mn)/(mx-mn)*54;
  return`<svg viewBox="0 0 300 70" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts.map((p,i)=>X(i)+","+Y(p[1])).join(" ")}" fill="none" stroke="rgba(239,188,144,.5)" stroke-width="2" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>${pts.map((p,i)=>`<circle cx="${X(i)}" cy="${Y(p[1])}" r="${i===pts.length-1?4.5:2.5}" fill="${i===pts.length-1?"#EFBC90":"#7A5E4A"}"/>`).join("")}</svg>
  <div class="wsrow">${pts.map(([d],i)=>`<span>${i===pts.length-1?"Today":new Date(d+"T12:00:00").toLocaleDateString([], {weekday:"short"})}</span>`).join("")}</div>`};
 const delta=()=>{if(prev===null)return`<div class="wsd flat">First weigh-in. Nice.</div>`;const d=Math.round((val-prev)*10)/10;return`<div class="wsd ${d>0?"up":d<0?"dn":"flat"}">${d>0?"▲ +"+d+" lb":d<0?"▼ "+d+" lb":"Same as"} ${d?"from last time":"last time"}</div>`};
 openSheet(`<h2>Morning weigh-in</h2><p class="desc">After the bathroom, before food or water.</p>
 <div class="wsbig"><input id="wt" type="number" inputmode="decimal" step="0.1" value="${val.toFixed(1)}" aria-label="Weight in pounds"><span>lb</span></div><div id="wt-d">${delta()}</div>
 <div class="wsst">${[-1,-.1,.1,1].map(n=>`<button type="button" data-w="${n}" class="${Math.abs(n)<1?"s":""}">${n>0?"+":"−"}${Math.abs(n)}</button>`).join("")}</div>
 <div class="wsspark" id="wt-sp">${spark()}</div>
 ${st?`<p class="wsmsg ${st.tone}">${esc(st.msg)}</p>`:`<p class="wsmsg">Goal: +0.25–0.75 lb a week.</p>`}
 <div class="btns"><button class="action p" id="wt-save">Save ${val.toFixed(1)} lb</button></div>`,
 root=>{const inp=root.querySelector("#wt"),sv=root.querySelector("#wt-save");
  const upd=(fromInput)=>{if(!fromInput)inp.value=val.toFixed(1);root.querySelector("#wt-d").innerHTML=delta();root.querySelector("#wt-sp").innerHTML=spark();sv.textContent=`Save ${(+val).toFixed(1)} lb`};
  root.querySelectorAll("[data-w]").forEach(b=>b.onclick=()=>{val=Math.round((val+ +b.dataset.w)*10)/10;try{navigator.vibrate&&navigator.vibrate(6)}catch(e){}upd()});
  inp.oninput=()=>{const v=+inp.value;if(v>50&&v<500){val=v;upd(true)}};
  sv.onclick=()=>{const v=+root.querySelector("#wt").value;if(!(v>50&&v<500)){toast("Enter your weight in pounds");return}S.weights[k]=Math.round(v*10)/10;
   const t=taskId||(S.routine.find(r=>r.link==="weigh")||{}).id;const dd=dayData(k);save();closeSheet();if(t&&!dd.done[t])toggleTask(t);else toast("Weight saved");renderFood()}})}
function grocerySheet(){const k=dkey(),nextWeek=dowOf(k)===0,ref=new Date(k+"T12:00:00");if(nextWeek)ref.setDate(ref.getDate()+1);const rk=dkey(ref),wk=mealWeek(rk),ws=weekStartOf(rk);
 const ticks=S.food.grocery[ws]=S.food.grocery[ws]||{};const draw=root=>{root.innerHTML=`<div class="grab"></div><h2>Grocery list</h2><p class="desc">${nextWeek?"For next week":"For this week"}: Week ${wk}, ${esc(MENU_THEMES[wk-1])}. Tick what you've got.</p>
  <div class="note">This week's meals: ${ROLE_ORDER.map(r=>recipeFor(r,rk)).filter(Boolean).map(r=>esc(r.name)).join(" · ")}</div>
  ${Object.entries(GROCERY).map(([cat,items])=>`<h3 class="rh">${esc(cat)}</h3><div class="steps">${items.map(x=>`<button type="button" class="step ${ticks[x]?"on":""}" data-x="${esc(x)}"><span class="ck">${ticks[x]?"✓":""}</span><span>${esc(x)}</span></button>`).join("")}</div>`).join("")}
  <div class="btns"><button class="action" id="g-clear">Clear ticks</button></div>`;
  root.querySelectorAll(".step").forEach(b=>b.onclick=()=>{const x=b.dataset.x;ticks[x]=!ticks[x];if(!ticks[x])delete ticks[x];save();draw(root)});
  root.querySelector("#g-clear").onclick=()=>{for(const x in ticks)delete ticks[x];save();draw(root)}};
 $("sheet").innerHTML="";$("sheetwrap").hidden=false;draw($("sheet"))}
function linkLabel(link){if(link==="money")return "Open Money";if(link==="dogweigh")return "Enter weights";if(link==="dogs")return "Check in";if(link==="freezer")return "Freezer count";if(link==="dogbatch")return "Open recipe";if(link==="water")return "Log water";if(link==="weigh")return "Log weight";if(link==="grocery")return "Grocery list";if(link==="menu")return "This week's menu";const r=recipeFor(link);return r?"Open recipe":"Open Food"}
function followLink(link,id){closeSheet();if(link==="money")return go("money");if(link==="dogweigh")return dogEdit();if(link==="dogs")return dogCheckIn();if(link==="freezer"){S.ui.who="dog";return go("food")}if(link==="dogbatch"){const r=S.food.recipes.find(x=>x.name===HUSKY_RECIPE.name);return r?openRecipe(r.id):(S.ui.who="dog",go("food"))}if(link==="water")return openWater();if(link==="weigh")return weighSheet(id);if(link==="grocery")return grocerySheet();if(link==="menu"){S.ui.who="me";return go("food")}
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
 <div class="note"><b>Phone calendar (recommended).</b> Adds your timed routine as repeating calendar events with an alert at the start time. They go off even when Op-Lock In is closed. Weekly tasks only repeat on their day.</div>
 <div class="btns" style="margin-top:0"><button class="action p" id="al-cal">Add my routine to my calendar</button></div>
 <p class="desc" style="margin-top:6px">If you change times later, add it again and delete the old "Op-Lock In" events in your calendar.</p>
 ${typeof Notification!=="undefined"?`<div class="sec"><h3>App notifications</h3><p class="desc">"Now: Gym · Up next: AI Academy at 3:30 PM". These only arrive while Op-Lock In is running in the background.</p><div class="btns" style="margin-top:8px"><button class="action" id="al-notif">${on?"On · turn off":"Turn on"}</button></div></div>`:""}`,
 root=>{root.querySelector("#al-cal").onclick=()=>routineCalendar();const nb=root.querySelector("#al-notif");if(nb)nb.onclick=async()=>{if(on){S.settings.taskAlerts=false;save();closeSheet();toast("Task notifications off");return}
  const r=await Notification.requestPermission();if(r==="granted"){S.settings.taskAlerts=true;save();closeSheet();toast("Task notifications on")}else toast("Notifications are blocked. Allow them for this app in Android settings.")}})}
function routineCalendar(){const BY=["SU","MO","TU","WE","TH","FR","SA"],stamp=new Date().toISOString().replace(/[-:]/g,"").slice(0,15)+"Z";
 const L=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Op-Lock In//Routine//EN","CALSCALE:GREGORIAN"];let n=0;
 const clean=s=>String(s).replace(/[\\;,]/g,m=>"\\"+m).replace(/\n/g,"\\n");
 for(const r of S.routine){const m=tmin(r.time);if(m>=9998)continue;const hh=String(Math.floor(m/60)).padStart(2,"0"),mm=String(m%60).padStart(2,"0");
  const d=new Date();if(r.dow&&r.dow.length&&r.dow.length<7){while(!r.dow.includes(d.getDay()))d.setDate(d.getDate()+1)}const ds=dkey(d).replace(/-/g,"");n++;
  L.push("BEGIN:VEVENT",`UID:dailyhq-${r.id}@dailyhq`,`DTSTAMP:${stamp}`,`DTSTART:${ds}T${hh}${mm}00`,"DURATION:PT15M",r.dow&&r.dow.length&&r.dow.length<7?`RRULE:FREQ=WEEKLY;BYDAY=${r.dow.map(x=>BY[x]).join(",")}`:"RRULE:FREQ=DAILY",
   `SUMMARY:${clean(r.t)}`,`DESCRIPTION:${clean("Op-Lock In"+(r.optional?" (optional)":"")+(r.steps&&r.steps.length?" · "+r.steps.length+" steps":""))}`,"TRANSP:TRANSPARENT","BEGIN:VALARM","ACTION:DISPLAY",`DESCRIPTION:${clean(r.t)}`,"TRIGGER:PT0M","END:VALARM","END:VEVENT")}
 L.push("END:VCALENDAR");const file=new File([L.join("\r\n")],"daily-hq-routine.ics",{type:"text/calendar"});
 const dl=()=>{const u=URL.createObjectURL(file),x=document.createElement("a");x.href=u;x.download=file.name;document.body.appendChild(x);x.click();setTimeout(()=>{URL.revokeObjectURL(u);x.remove()},1500);toast(`${n} routine reminders saved. Open the file to add them to your Calendar.`)};
 if(navigator.canShare&&navigator.canShare({files:[file]}))navigator.share({files:[file],title:"Op-Lock In routine"}).then(()=>toast("Pick your Calendar app to add the reminders")).catch(e=>{if(e&&e.name!=="AbortError")dl()});else dl()}

/* ================= dock shortcuts: open the installed app when possible ================= */
const SHORTCUTS=[
 {name:"Polymarket",tile:"PM",bg:"#2E5BFF",fg:"#fff",pkg:"com.polymarket.android",url:"https://polymarket.com/crypto/5M"},
 {name:"Coinbase",tile:"C",bg:"#0052FF",fg:"#fff",pkg:"com.coinbase.android",url:"https://www.coinbase.com/home"},
 {name:"TradingView",tile:"TV",bg:"#131722",fg:"#fff",pkg:"com.tradingview.tradingviewapp",url:"https://www.tradingview.com/chart/?symbol=BTCUSD"},
 {name:"Liquid Brokers",tile:"LB",bg:"#0E3B43",fg:"#7FE3D0",url:"https://my.liquidbrokers.com/auth/login"},
 {name:"THTrader",tile:"TH",bg:"#1F1F2E",fg:"#F1C39D",url:"https://main.thtrader.app"},
 {name:"Slack",tile:"#",bg:"#4A154B",fg:"#fff",pkg:"com.Slack",url:"https://app.slack.com/client"},
 {name:"Calendar",tile:"31",bg:"#fff",fg:"#1A73E8",pkg:"com.samsung.android.calendar",url:"https://calendar.google.com"},
 {name:"YouTube",tile:"▶",bg:"#FF0033",fg:"#fff",pkg:"com.google.android.youtube",url:"https://www.youtube.com"}];
const AL=(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform()&&window.Capacitor.Plugins)?window.Capacitor.Plugins.AppLauncher:null;
async function openShortcut(s){if(AL&&s.pkg){try{const r=await AL.canOpenUrl({url:s.pkg});if(r&&r.value){await AL.openUrl({url:s.pkg});return}}catch(e){}}
 const a=document.createElement("a");a.href=s.url;a.target="_blank";a.rel="noopener";document.body.appendChild(a);a.click();a.remove()}
(function renderShortcuts(){const host=$("shortcuts");if(!host)return;host.innerHTML=SHORTCUTS.map((s,i)=>`<button class="db" data-sc="${i}" style="--i:${i+1}" aria-label="Open ${esc(s.name)}"><span class="tile" style="background:${s.bg};color:${s.fg}">${esc(s.tile)}</span><span class="tip">${esc(s.name)}</span></button>`).join("");
 host.querySelectorAll("[data-sc]").forEach(b=>b.onclick=()=>openShortcut(SHORTCUTS[+b.dataset.sc]))})();

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
   const PRE=t.pre||N.pre;if(PRE>0){const pre=atDate(k,t.T-PRE);if(pre>now&&t.st!=="pre")out.push({id:nid(k+t.id+"p"),title:`In ${PRE} min: ${t.t}`,body:`Starts at ${t.time}${steps}.`,schedule:{at:pre,allowWhileIdle:true},channelId:"tasks",actionTypeId:"TASK",extra})}
   const dl=atDate(k,t.dl);if(N.missed&&!t.optional&&t.st!=="pre"&&dl>now)out.push({id:nid(k+t.id+"m"),title:"Missed: "+t.t,body:`Planned for ${t.time}. Tap Done if you did it, or check it off late in Today.`,schedule:{at:dl,allowWhileIdle:true},channelId:"missed",actionTypeId:"MISSED",extra})}
  if(i===0&&typeof foodNotifs==="function")out.push(...foodNotifs(now));
  if(N.water&&!(i===0&&waterToday()>=W().goal)){for(let m=tmin(W().start);m<=tmin(W().end);m+=W().every){const at=atDate(k,m);if(at>now)out.push({id:nid(k+"w"+m),title:"💧 Time for water",body:`Log ${W().step} ml. Goal ${fmtL(W().goal)} today.`,schedule:{at,allowWhileIdle:true},channelId:"water",actionTypeId:"WATER",extra:{k,kind:"water"}})}}}
 out.sort((a,b)=>a.schedule.at-b.schedule.at);return out.slice(0,400)}
async function scheduleNative(){if(!LN)return;try{const list=buildNotifs();const p=await LN.getPending();
  if(p&&p.notifications&&p.notifications.length)await LN.cancel({notifications:p.notifications.map(n=>({id:n.id}))});
  if(list.length)await LN.schedule({notifications:list.map(n=>({...n,smallIcon:"ic_stat_dailyhq",iconColor:"#EFBC90"}))});
  S.native={...(S.native||{}),count:list.length,at:Date.now(),next:list[0]?{t:list[0].title,at:+list[0].schedule.at}:null};try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}catch(e){console.warn("schedule failed",e)}}
async function nativeInit(){if(!LN)return;try{
 for(const c of [{id:"tasks",name:"Tasks: now and next",importance:4},{id:"missed",name:"Missed tasks",importance:4},{id:"water",name:"Water reminders",importance:3},{id:"food",name:"Eat reminders",importance:4}])await LN.createChannel({...c,visibility:1,vibration:true,lights:true,lightColor:"#EFBC90"}).catch(()=>{});
 await LN.registerActionTypes({types:[{id:"TASK",actions:[{id:"done",title:"Done"},{id:"snooze",title:"Snooze 10 min"}]},{id:"MISSED",actions:[{id:"done",title:"Done (late)"}]},{id:"WATER",actions:[{id:"log",title:`Log ${W().step} ml`}]}]});
 const perm=await LN.checkPermissions();if(perm.display!=="granted")await LN.requestPermissions();
 LN.addListener("localNotificationActionPerformed",ev=>setTimeout(()=>handleNotif(ev),300));
 nativeReady=true;await scheduleNative()}catch(e){console.warn("native init failed",e)}}
function handleNotif(ev){const n=ev.notification||{},x=n.extra||{},a=ev.actionId;closeSheet();orbit(false);
 if(x.kind==="food"){go("today");setTimeout(()=>openFood("me"),450);return}
 if(x.kind==="water"){if(a==="log")addWater(W().step);else{go("today");openWater()}return}
 if(!x.id)return;const dd=dayData(x.k),t=tasksFor(x.k).find(y=>y.id===x.id);
 if(a==="done"){if(!dd.done[x.id])toggleTask(x.id,null,x.k);go("today");toast("Checked off: "+(t?t.t:"task"));return}
 if(a==="snooze"&&LN){LN.schedule({notifications:[{id:nid(x.id+Date.now()),title:n.title,body:n.body,channelId:"tasks",actionTypeId:"TASK",extra:x,smallIcon:"ic_stat_dailyhq",iconColor:"#EFBC90",schedule:{at:new Date(Date.now()+600000),allowWhileIdle:true}}]});toast("Snoozed for 10 minutes");return}
 go("today");if(t&&x.k===dkey()&&((t.steps&&t.steps.length)||t.note||t.link))setTimeout(()=>{if(t.link==="water")openWater();else if(t.link==="dogs")dogCheckIn();else openSteps(t.id)},450)}
function nativeAlertsSheet(){const N=nset(),nx=S.native&&S.native.next;
 openSheet(`<h2>Notifications</h2><p class="desc">Scheduled on your phone, so they arrive even when Op-Lock In is closed. ${S.native?S.native.count+" coming up over the next "+NOTIF_DAYS+" days.":""}${nx?` Next: “${esc(nx.t)}” at ${new Date(nx.at).toLocaleString([], {weekday:"short",hour:"numeric",minute:"2-digit"})}.`:""}</p>
 <div class="field"><label><input type="checkbox" id="nt-start" ${N.start?"checked":""} style="width:auto;margin-right:8px">When each task starts, with what's up next</label></div>
 <div class="field"><label>Heads-up before each task</label>${opts("pre",[["0","Off"],["5","5 min"],["10","10 min"],["15","15 min"]],String(N.pre||0))}</div>
 <div class="field"><label><input type="checkbox" id="nt-missed" ${N.missed?"checked":""} style="width:auto;margin-right:8px">When I miss a task (skipped if I already checked it off)</label></div>
 <div class="field"><label><input type="checkbox" id="nt-water" ${N.water?"checked":""} style="width:auto;margin-right:8px">Water reminders (${esc(W().start)}–${esc(W().end)}, every ${W().every} min, stop once I hit ${fmtL(W().goal)})</label></div>
 <div class="btns"><button class="action p" id="nt-save">Save</button><button class="action" id="nt-test">Send a test in 5 seconds</button></div>
 <p class="desc" style="margin-top:12px">Notifications have buttons: Done, Snooze 10 min, and Log ${W().step} ml. If they don't arrive, open Android Settings → Apps → Op-Lock In → Notifications and make sure they're allowed, and set Battery to Unrestricted.</p>`,
 root=>{bindOpts(root);root.querySelector("#nt-save").onclick=async()=>{Object.assign(N,{start:root.querySelector("#nt-start").checked,missed:root.querySelector("#nt-missed").checked,water:root.querySelector("#nt-water").checked,pre:+optVal(root,"pre")||0});save();await scheduleNative();closeSheet();toast(`Saved · ${S.native.count} notifications scheduled`)};
  root.querySelector("#nt-test").onclick=async()=>{const perm=await LN.checkPermissions();if(perm.display!=="granted"){const r=await LN.requestPermissions();if(r.display!=="granted"){toast("Notifications are off for Op-Lock In in Android settings");return}}
   const nx2=nextInfo();await LN.schedule({notifications:[{id:nid("test"+Date.now()),title:nx2.t?"Now: "+nx2.t.t:"Op-Lock In test",body:"This is how your reminders will look.",channelId:"tasks",actionTypeId:"TASK",extra:nx2.t?{k:dkey(),id:nx2.t.id,kind:"task"}:{},smallIcon:"ic_stat_dailyhq",iconColor:"#EFBC90",schedule:{at:new Date(Date.now()+5000),allowWhileIdle:true}}]});toast("Test coming in 5 seconds. You can close the app.")}})}

/* ================= money (expenses) ================= */
// Category colors match the chart colors; the four smaller categories share "Other" gray.
const MCATS=[["Groceries","#3987e5"],["Eating out","#d95926"],["Gas & transport","#c98500"],["Bills & utilities","#6F8482"],["Subscriptions","#d55181"],["Shopping","#0ca30c"],["Health & care","#6F8482"],["Pets","#199e70"],["Smoking","#9085e9"],["Fun","#e66767"],["Trading fees","#6F8482"],["Other","#6F8482"]];
const MCOL=Object.fromEntries(MCATS);
const MO=()=>S.money||(S.money={items:[],budget:0,pay:"Card"});
const usd=n=>"$"+(+n).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
const monthKey=d=>`${d.getFullYear()}-${d.getMonth()}`;
function moneyStats(){const now=new Date(),it=MO().items,mk=monthKey(now),pm=new Date(now.getFullYear(),now.getMonth()-1,1);
 const sum=l=>l.reduce((t,x)=>t+(+x.amt||0),0),inMonth=(x,d)=>monthKey(new Date(x.ts))===monthKey(d);
 const month=it.filter(x=>inMonth(x,now)),today=it.filter(x=>sameDay(x.ts)),wk=it.filter(x=>x.ts>Date.now()-7*864e5);
 const lastSame=it.filter(x=>inMonth(x,pm)&&new Date(x.ts).getDate()<=now.getDate());
 const cats={};month.forEach(x=>cats[x.cat]=(cats[x.cat]||0)+(+x.amt||0));
 const dim=new Date(now.getFullYear(),now.getMonth()+1,0).getDate(),left=dim-now.getDate()+1;
 return{month:sum(month),today:sum(today),week:sum(wk),lastSame:sum(lastSame),cats:Object.entries(cats).sort((a,b)=>b[1]-a[1]),left,dim,count:month.length}}
let mDraft={amt:"",cat:"Groceries",note:""};
function renderMoney(){const M=MO(),st=moneyStats();
 $("moneyadd").innerHTML=`<span class="eyebrow">Log a purchase</span>
  <div class="amtrow"><span>$</span><input id="m-amt" inputmode="decimal" placeholder="0.00" value="${esc(mDraft.amt)}" aria-label="Amount" autocomplete="off"></div>
  <div class="chips quickamt">${[5,10,20,50].map(v=>`<button type="button" class="chip" data-q="${v}">$${v}</button>`).join("")}</div>
  <div class="field"><label>Category</label><div class="chips wrap catpick">${MCATS.map(([c,col])=>`<button type="button" class="chip ${mDraft.cat===c?"on":""}" data-c="${esc(c)}"><i style="background:${col}"></i>${esc(c)}</button>`).join("")}</div></div>
  <div class="pair"><div class="field"><label for="m-note">What was it?</label><input id="m-note" value="${esc(mDraft.note)}" placeholder="Costco, gas, Netflix…" autocomplete="off"></div><div class="field"><label>Paid with</label>${opts("pay",[["Card","Card"],["Cash","Cash"],["Other","Other"]],M.pay||"Card")}</div></div>
  <button class="action p big-btn" id="m-add" style="width:100%;margin-top:16px">Log purchase</button>`;
 const amt=$("m-amt"),upBtn=()=>{const v=parseFloat(amt.value);$("m-add").textContent=v>0?`Log ${usd(v)} · ${mDraft.cat}`:"Log purchase"};
 amt.oninput=()=>{mDraft.amt=amt.value;upBtn()};$("m-note").oninput=e=>mDraft.note=e.target.value;
 $("moneyadd").querySelectorAll("[data-q]").forEach(b=>b.onclick=()=>{amt.value=b.dataset.q;mDraft.amt=amt.value;upBtn()});
 $("moneyadd").querySelectorAll(".catpick .chip").forEach(b=>b.onclick=()=>{mDraft.cat=b.dataset.c;$("moneyadd").querySelectorAll(".catpick .chip").forEach(x=>x.classList.toggle("on",x===b));upBtn()});
 bindOpts($("moneyadd"),(n,v)=>{M.pay=v;save()});upBtn();
 $("m-add").onclick=e=>{const v=Math.round(parseFloat(amt.value)*100)/100;if(!(v>0)){toast("Enter an amount first");amt.focus();return}
  M.items.push({id:uid(),ts:Date.now(),amt:v,cat:mDraft.cat,note:mDraft.note.trim(),pay:M.pay||"Card"});mDraft={amt:"",cat:mDraft.cat,note:""};save();renderMoney();toast(`Logged ${usd(v)}`);burst(e.currentTarget,["#86D3B0","#EFBC90"])};
 const vs=st.lastSame?st.month-st.lastSame:null,b=+M.budget||0,pct=b?Math.min(100,st.month/b*100):0,perDay=b?Math.max(0,(b-st.month)/st.left):0,RC=2*Math.PI*15;
 const ringCol=pct>=100?"var(--rose)":pct>85?"#E9C46A":"var(--mint)";
 $("moneysum").innerHTML=`<div class="msrow"><button class="msring" id="m-budget" aria-label="${b?"Change monthly budget":"Set a monthly budget"}"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="4" ${b?"":'stroke-dasharray="3 3"'}/>${b?`<circle cx="18" cy="18" r="15" fill="none" stroke="${ringCol}" stroke-width="4" stroke-linecap="round" stroke-dasharray="${(pct/100*RC).toFixed(1)} ${RC.toFixed(1)}" transform="rotate(-90 18 18)"/>`:""}</svg><b>${b?Math.round(st.month/b*100)+"%":"Set<br>budget"}</b></button>
  <div class="msmain"><span class="eyebrow">${new Date().toLocaleDateString([], {month:"long"})} spending</span><div class="msbig">${usd(st.month)}</div><div class="sub">${b?(st.month>b?`${usd(st.month-b)} over your ${usd(b)} budget`:`${usd(b-st.month)} left of ${usd(b)} · ~${usd(perDay)}/day`):"Tap the ring to set a monthly budget"}</div></div></div>
  <div class="msminis"><div><small>Today</small><b>${usd(st.today)}</b></div><div><small>7 days</small><b>${usd(st.week)}</b></div><div><small>vs last month</small><b class="${vs>0?"dn":vs<0?"up":""}">${vs===null?"—":(vs>0?"+":"−")+usd(Math.abs(vs))}</b></div></div>`;
 $("m-budget").onclick=()=>openSheet(`<h2>Monthly budget</h2><p class="desc">The ring fills as you spend. Below it you'll see what's left and what you can spend per day to stay on track.</p><div class="field"><label for="bud">Budget ($)</label><input id="bud" type="number" inputmode="decimal" value="${b||""}" placeholder="2000"></div><div class="btns"><button class="action p" id="bud-s">Save</button></div>`,r=>{r.querySelector("#bud-s").onclick=()=>{M.budget=Math.max(0,+r.querySelector("#bud").value||0);save();closeSheet();renderMoney();toast("Budget saved")}});
 const mx=Math.max(1,...st.cats.map(c=>c[1]));
 $("moneycats").innerHTML=`<div class="mchead"><b>Top categories</b><span class="eyebrow">This month</span></div>${st.cats.length?st.cats.slice(0,5).map(([c,v])=>`<div class="mcat"><i style="background:${mcol(c)}2E">${MICO[c]||"•"}</i><div class="m">${esc(c)}<small>${Math.round(v/Math.max(1,st.month)*100)}% of the month</small><div class="bar"><b style="width:${v/mx*100}%;background:${mcol(c)}"></b></div></div><b class="num">${usd(v)}</b></div>`).join(""):`<div class="empty"><b>Nothing logged this month</b>Your top categories show up here.</div>`}`;
 renderHistory();renderWish();mTab(S.ui.mtab||"ov",true)}
/* ---- Money tabs, charts and history ---- */
// Chart colors: 8 validated categorical hues (fixed order, checked for colorblind separation on the dark surface). Smaller categories fold into "Other".
const MSERIES=[["Groceries","#3987e5"],["Eating out","#d95926"],["Pets","#199e70"],["Gas & transport","#c98500"],["Subscriptions","#d55181"],["Shopping","#0ca30c"],["Smoking","#9085e9"],["Fun","#e66767"],["Other","#6F8482"]];
const MSC=Object.fromEntries(MSERIES),mser=c=>MSC[c]?c:"Other",mcol=c=>MSC[mser(c)];
const MICO={"Groceries":"🛒","Eating out":"🍔","Gas & transport":"⛽","Bills & utilities":"💡","Subscriptions":"📺","Shopping":"🛍️","Health & care":"💊","Pets":"🐾","Smoking":"🌬️","Fun":"🎉","Trading fees":"📈","Other":"•"};
const mHidden=new Set();let mHF="All",mUnHL=null;
function mTab(t,quiet){S.ui.mtab=t;document.querySelectorAll("#mtabs button").forEach(b=>{const on=b.dataset.mt===t;b.classList.toggle("on",on);b.setAttribute("aria-selected",on)});
 document.querySelectorAll("#p-money .mview").forEach(v=>v.classList.toggle("on",v.id==="mv-"+t));mTabHL();
 if(t==="ov")requestAnimationFrame(drawMChart);if(!quiet)save()}
function mTabHL(){const b=document.querySelector("#mtabs button.on"),hl=$("mtabhl");if(b&&hl&&b.offsetWidth){hl.style.left=b.offsetLeft+"px";hl.style.width=b.offsetWidth+"px"}}
document.querySelectorAll("#mtabs button").forEach(b=>b.onclick=()=>mTab(b.dataset.mt));
document.querySelectorAll("#mcview button").forEach(b=>b.onclick=()=>{S.ui.mview=b.dataset.v;save();drawMChart()});
$("mtblbtn").onclick=()=>{const t=$("mtbl");t.hidden=!t.hidden;$("mtblbtn").textContent=t.hidden?"Show as table":"Hide table"};
document.addEventListener("pointerdown",e=>{if(!e.target.closest("#mcwrap [data-hit]"))mHideTip()},true);
addEventListener("resize",()=>{if($("p-money").classList.contains("on")){mTabHL();if(S.ui.mtab==="ov"||!S.ui.mtab)drawMChart()}});
function mShowTip(x,y,html){const t=$("mtip"),W=$("mcwrap").clientWidth;t.innerHTML=html;t.style.left=Math.max(70,Math.min(W-70,x))+"px";t.style.top=Math.max(34,y)+"px";t.classList.add("on")}
function mHideTip(){$("mtip").classList.remove("on");if(mUnHL){mUnHL();mUnHL=null}}
const niceTop=v=>{if(!(v>0))return 50;const m=Math.pow(10,Math.floor(Math.log10(v))),n=v/m;return(n<=1?1:n<=2?2:n<=2.5?2.5:n<=5?5:10)*m};
function drawMChart(){const svg=$("mchart"),wrap=$("mcwrap");if(!svg||!wrap||!wrap.clientWidth)return;
 const W=wrap.clientWidth,view=S.ui.mview||"days",M=MO(),now=new Date(),NS="http://www.w3.org/2000/svg";
 document.querySelectorAll("#mcview button").forEach(b=>b.classList.toggle("on",b.dataset.v===view));
 svg.innerHTML="";$("mtip").classList.remove("on");mUnHL=null;
 const el=(t,a)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);return e},txt=(x,y,s,a={})=>{const t=el("text",{x,y,fill:"#7F9593","font-size":10,"font-family":"Work Sans, sans-serif",...a});t.textContent=s;svg.append(t);return t};
 const hit=(node,show,hl)=>{node.setAttribute("data-hit",1);const on=()=>{if(mUnHL)mUnHL();show();if(hl){hl(true);mUnHL=()=>hl(false)}};
  node.addEventListener("pointerenter",e=>{if(e.pointerType==="mouse")on()});node.addEventListener("pointerdown",on);node.addEventListener("pointerleave",e=>{if(e.pointerType==="mouse")mHideTip()})};
 const mk=monthKey(now),month=M.items.filter(x=>monthKey(new Date(x.ts))===mk),cap=$("mccap"),leg=$("mlegend"),tbl=$("mtbl");
 const totals={};month.forEach(x=>{const c=mser(x.cat);totals[c]=(totals[c]||0)+(+x.amt||0)});
 const present=MSERIES.map(s=>s[0]).filter(c=>totals[c]>0),sumAll=present.reduce((t,c)=>t+totals[c],0);
 const legend=pctMode=>{leg.innerHTML=present.length>1?present.map(c=>`<button class="mlg ${mHidden.has(c)?"dim":""}" data-c="${esc(c)}" aria-pressed="${!mHidden.has(c)}"><i style="background:${MSC[c]}"></i><span>${esc(c)}</span><b>${pctMode?Math.round(totals[c]/sumAll*100)+"%":usd(totals[c])}</b></button>`).join(""):"";
  leg.querySelectorAll(".mlg").forEach(b=>b.onclick=()=>{const c=b.dataset.c;mHidden.has(c)?mHidden.delete(c):mHidden.add(c);if(present.every(x=>mHidden.has(x)))mHidden.delete(c);drawMChart()})};
 const table=(h,rows)=>{tbl.innerHTML=`<table><tr><th>${h[0]}</th><th>${h[1]}</th></tr>${rows.map(r=>`<tr><td>${esc(r[0])}</td><td>${r[1]}</td></tr>`).join("")}</table>`};
 if(view==="days"){$("mctitle").textContent="Daily spending";const H=160,pb=18,pt=12,ph=H-pb-pt,dim=new Date(now.getFullYear(),now.getMonth()+1,0).getDate(),today=now.getDate();
  svg.setAttribute("viewBox",`0 0 ${W} ${H}`);svg.setAttribute("height",H);
  const vis=MSERIES.map(s=>s[0]).filter(c=>!mHidden.has(c)),days=[...Array(dim)].map(()=>({}));
  month.forEach(x=>{const d=new Date(x.ts).getDate()-1,c=mser(x.cat);days[d][c]=(days[d][c]||0)+(+x.amt||0)});
  const tot=days.map(d=>vis.reduce((t,c)=>t+(d[c]||0),0)),top=niceTop(Math.max(...tot));
  [0,.5,1].forEach(f=>{const y=pt+ph*(1-f);svg.append(el("line",{x1:0,x2:W,y1:y,y2:y,stroke:"rgba(255,255,255,.07)","stroke-width":1}));if(f)txt(W,y-3,"$"+Math.round(top*f),{"text-anchor":"end"})});
  const bw=(W-4)/dim,w=Math.max(3,bw-3);
  days.forEach((d,i)=>{const x=2+i*bw;
   if(i>=today){svg.append(el("rect",{x,y:pt+ph-2,width:w,height:2,rx:1,fill:"rgba(255,255,255,.08)"}));}
   else{let y0=pt+ph;const g=el("g",{});vis.forEach(c=>{if(!d[c])return;const h=d[c]/top*ph;y0-=h;g.append(el("rect",{x,y:y0+1,width:w,height:Math.max(1,h-1.5),rx:1.5,fill:MSC[c]}))});svg.append(g);
    const ht=el("rect",{x:x-1.5,y:pt,width:bw,height:ph,fill:"transparent"});svg.append(ht);
    const lines=vis.filter(c=>d[c]).map(c=>`<span><i style="background:${MSC[c]}"></i>${esc(c)}</span><em>${usd(d[c])}</em>`).join("");
    hit(ht,()=>mShowTip(x+w/2,pt+ph-tot[i]/top*ph-8,`<b>${now.toLocaleDateString([], {month:"short"})} ${i+1} · ${usd(tot[i])}</b>${lines?`<div class="mtl">${lines}</div>`:"<span>Nothing spent</span>"}`),on=>g.style.opacity=on?.75:1)}
   if(i===0||(i+1)%5===0)txt(x+w/2,H-4,String(i+1),{"text-anchor":"middle","font-weight":i+1===today?700:400,fill:i+1===today?"#EEF3F0":"#7F9593"})});
  const spent=tot.slice(0,today).reduce((a,b)=>a+b,0),big=Math.max(...tot);
  cap.textContent=spent?`Average ${usd(spent/today)} a day so far · biggest day ${now.toLocaleDateString([], {month:"short"})} ${tot.indexOf(big)+1} (${usd(big)})`:"Log purchases and each day fills in here, split by category.";
  legend(false);table(["Day","Spent"],tot.slice(0,today).map((v,i)=>[`${now.toLocaleDateString([], {month:"short"})} ${i+1}`,usd(v)]).reverse())}
 if(view==="split"){$("mctitle").textContent="Where it went";const H=180,cx=W/2,cy=H/2,r=70,sw=22;svg.setAttribute("viewBox",`0 0 ${W} ${H}`);svg.setAttribute("height",H);
  const vis=present.filter(c=>!mHidden.has(c)),sum=vis.reduce((t,c)=>t+totals[c],0);
  svg.append(el("circle",{cx,cy,r,fill:"none",stroke:"rgba(255,255,255,.06)","stroke-width":sw}));
  let a=-Math.PI/2;const P=(ang,rr)=>[cx+Math.cos(ang)*rr,cy+Math.sin(ang)*rr];
  if(vis.length===1){const c=vis[0],ring=el("circle",{cx,cy,r,fill:"none",stroke:MSC[c],"stroke-width":sw});svg.append(ring);hit(ring,()=>mShowTip(cx,cy-r-10,`<b>${esc(c)} · ${usd(totals[c])}</b><span>All of the shown spending</span>`))}
  else vis.forEach(c=>{const v=totals[c],da=v/sum*Math.PI*2,gap=Math.min(.04,da*.3),a0=a+gap/2,a1=a+da-gap/2;a+=da;const [x0,y0]=P(a0,r),[x1,y1]=P(a1,r),[tx,ty]=P((a0+a1)/2,r);
   const p=el("path",{d:`M${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 ${a1-a0>Math.PI?1:0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`,fill:"none",stroke:MSC[c],"stroke-width":sw});p.style.transition="stroke-width .15s";svg.append(p);
   hit(p,()=>mShowTip(tx,ty-16,`<b>${esc(c)} · ${usd(v)}</b><span>${Math.round(v/sum*100)}% of ${mHidden.size?"what's shown":"the month"}</span>`),on=>p.setAttribute("stroke-width",on?sw+6:sw))});
  txt(cx,cy+1,usd(sum),{"text-anchor":"middle",fill:"#EEF3F0","font-size":19,"font-weight":600});txt(cx,cy+18,mHidden.size?"shown categories":"this month",{"text-anchor":"middle","font-size":11});
  const tc=vis.slice().sort((x,y)=>totals[y]-totals[x])[0];cap.textContent=tc?`${tc} is your biggest category at ${Math.round(totals[tc]/sum*100)}%.`:"Log purchases to see where your money goes.";
  legend(true);table(["Category","Spent"],vis.map(c=>[c,usd(totals[c])]))}
 if(view==="months"){$("mctitle").textContent="Last 6 months";const H=160,pb=18,pt=16,ph=H-pb-pt,b=+M.budget||0;svg.setAttribute("viewBox",`0 0 ${W} ${H}`);svg.setAttribute("height",H);
  const ms=[...Array(6)].map((_,i)=>{const d=new Date(now.getFullYear(),now.getMonth()-5+i,1),k=monthKey(d);return{d,label:d.toLocaleDateString([], {month:"short"}),v:M.items.filter(x=>monthKey(new Date(x.ts))===k).reduce((t,x)=>t+(+x.amt||0),0)}});
  const top=niceTop(Math.max(b*1.15,...ms.map(m=>m.v))),bw=W/6,w=Math.min(36,bw-16);
  svg.append(el("line",{x1:0,x2:W,y1:pt+ph,y2:pt+ph,stroke:"rgba(255,255,255,.1)"}));
  if(b){const by=pt+ph*(1-b/top);svg.append(el("line",{x1:0,x2:W,y1:by,y2:by,stroke:"#EFBC90","stroke-width":1.5,"stroke-dasharray":"4 4"}));txt(2,by-5,"Budget "+usd(b).replace(/\.00$/,""),{fill:"#EFBC90","font-weight":600})}
  ms.forEach((m,i)=>{const cur=i===5,h=m.v/top*ph,x=i*bw+(bw-w)/2,y=pt+ph-h,rr=Math.min(4,h);
   const bar=el("path",{d:h>0?`M${x} ${pt+ph}V${y+rr}Q${x} ${y} ${x+rr} ${y}H${x+w-rr}Q${x+w} ${y} ${x+w} ${y+rr}V${pt+ph}Z`:"",fill:cur?"#3987e5":"#3A5257"});svg.append(bar);
   const ht=el("rect",{x:i*bw,y:pt,width:bw,height:ph,fill:"transparent"});svg.append(ht);
   hit(ht,()=>mShowTip(x+w/2,y-8,`<b>${m.d.toLocaleDateString([], {month:"long"})} · ${usd(m.v)}</b><span>${cur?"So far this month":"Total"}${b?(m.v>b?` · ${usd(m.v-b)} over budget`:` · ${usd(b-m.v)} under budget`):""}</span>`),on=>bar.style.opacity=on?.75:1);
   txt(x+w/2,H-4,m.label,{"text-anchor":"middle",fill:cur?"#EEF3F0":"#7F9593","font-weight":cur?600:400})});
  const past=ms.slice(0,5).filter(m=>m.v>0),avg=past.length?past.reduce((t,m)=>t+m.v,0)/past.length:0,over=b?past.filter(m=>m.v>b).length:0;
  cap.textContent=past.length?`You average ${usd(avg)} a month${b?`. ${over} of the last ${past.length} went over budget.`:"."}`:"Your monthly totals build up here over time.";
  leg.innerHTML="";table(["Month","Spent"],ms.map(m=>[m.d.toLocaleDateString([], {month:"long"}),usd(m.v)]).reverse())}}
function renderHistory(){const M=MO(),host=$("moneylog");if(!host)return;
 const all=[...M.items].sort((a,b)=>b.ts-a.ts),cats=[...new Set(all.map(x=>x.cat))];if(mHF!=="All"&&!cats.includes(mHF))mHF="All";
 const list=all.filter(x=>mHF==="All"||x.cat===mHF).slice(0,80),groups={};list.forEach(x=>{const k=dkey(new Date(x.ts));(groups[k]=groups[k]||[]).push(x)});
 host.innerHTML=(cats.length>1?`<div class="chips mhf">${["All",...cats].map(c=>`<button class="chip ${c===mHF?"on":""}" data-hf="${esc(c)}">${c==="All"?"":`<i style="background:${mcol(c)}"></i>`}${esc(c)}</button>`).join("")}</div>`:"")+
  (list.length?Object.entries(groups).map(([k,l])=>`<div class="mday"><span>${sameDay(l[0].ts)?"Today":new Date(k+"T12:00").toLocaleDateString([], {weekday:"long",month:"short",day:"numeric"})}</span><b>${usd(l.reduce((t,x)=>t+x.amt,0))}</b></div>${l.map(x=>`<button class="mhrow" data-mid="${x.id}"><span class="mic" style="background:${mcol(x.cat)}2E">${MICO[x.cat]||"•"}</span><span class="ti"><span class="tn">${esc(x.note||x.cat)}</span><small>${esc(x.cat)} · ${timeStr(x.ts)} · ${esc(x.pay||"")}</small></span><span class="amt">${usd(x.amt)}</span></button>`).join("")}`).join("")+(all.length>80&&mHF==="All"?`<p class="sub" style="margin-top:10px">Showing your latest 80 purchases.</p>`:""):`<div class="empty"><b>Log your first purchase</b>Type the amount, tap a category, done. It takes about 5 seconds.</div>`);
 host.querySelectorAll("[data-hf]").forEach(b=>b.onclick=()=>{mHF=b.dataset.hf;renderHistory()});
 host.querySelectorAll("[data-mid]").forEach(b=>b.onclick=()=>editMoney(b.dataset.mid))}
// Things to buy: a running list. Tap the circle when you buy it and it's logged as a purchase.
function renderWish(){const M=MO(),W=M.wish||(M.wish=[]),host=$("moneywish");if(!host)return;
 const list=[...W].sort((a,b)=>(b.need?1:0)-(a.need?1:0)||a.ts-b.ts),total=W.reduce((t,x)=>t+(+x.price||0),0),priced=W.filter(x=>+x.price>0).length;
 host.innerHTML=`<div class="row sb"><div><span class="ptitle">Things to buy</span><div class="sub">${W.length?`${W.length} on the list${priced?` · about ${usd(total)}`:""}`:"Stuff you need to pick up or are saving for"}</div></div></div>
 <form class="add wadd" id="w-add"><input id="w-t" placeholder="New running shoes" aria-label="Thing to buy" autocomplete="off"><input id="w-p" inputmode="decimal" placeholder="$ price" aria-label="Price (optional)" autocomplete="off"><button class="action p">Add</button></form>
 ${list.length?`<div class="wlist">${list.map(x=>`<div class="wi" data-row="${x.id}"><button class="wck" data-wb="${x.id}" aria-label="Bought ${esc(x.t)}"></button><button class="wmain" data-we="${x.id}"><span>${esc(x.t)}</span><small>${esc(x.cat||"Shopping")}</small></button><button class="wneed ${x.need?"on":""}" data-wn="${x.id}">${x.need?"Need":"Want"}</button><span class="amt">${+x.price>0?usd(x.price):""}</span></div>`).join("")}</div>
 <div class="sub" style="margin-top:10px">Tap the circle when you buy something and it's logged as a purchase. Tap Need/Want to switch.</div>`:`<div class="empty"><b>Nothing on the list</b>Add things as you think of them so you don't forget, or so you can save up.</div>`}`;
 $("w-add").onsubmit=e=>{e.preventDefault();const t=$("w-t").value.trim();if(!t){$("w-t").focus();return}const p=Math.round((parseFloat(String($("w-p").value).replace(/[$,]/g,""))||0)*100)/100;
  W.push({id:uid(),t,price:p>0?p:0,cat:"Shopping",need:false,ts:Date.now()});save();renderWish();toast("Added to Things to buy");$("w-t").focus()};
 host.querySelectorAll("[data-wn]").forEach(b=>b.onclick=()=>{const x=W.find(i=>i.id===b.dataset.wn);if(x){x.need=!x.need;save();renderWish()}});
 host.querySelectorAll("[data-we]").forEach(b=>b.onclick=()=>editWish(b.dataset.we));
 host.querySelectorAll("[data-wb]").forEach(b=>b.onclick=()=>{const x=W.find(i=>i.id===b.dataset.wb);if(!x)return;b.classList.add("on");b.closest(".wi").classList.add("bought");
  setTimeout(()=>{M.wish=M.wish.filter(i=>i.id!==x.id);
   if(+x.price>0){const p={id:uid(),ts:Date.now(),amt:+x.price,cat:x.cat||"Shopping",note:x.t,pay:M.pay||"Card"};M.items.push(p);save();renderMoney();burst(b,["#86D3B0","#EFBC90"]);
    toast(`Bought · logged ${usd(p.amt)}`,"Undo",()=>{M.items=M.items.filter(i=>i.id!==p.id);M.wish.push(x);save();renderMoney()})}
   else{mDraft={amt:"",cat:x.cat||"Shopping",note:x.t};save();renderMoney();toast("Bought · enter what you paid","Undo",()=>{M.wish.push(x);mDraft={amt:"",cat:"Groceries",note:""};save();renderMoney()});
    mTab("log");$("moneyadd").scrollIntoView({behavior:"smooth",block:"start"});setTimeout(()=>$("m-amt")&&$("m-amt").focus(),450)}},380)})}
function editWish(id){const M=MO(),x=(M.wish||[]).find(i=>i.id===id);if(!x)return;
 openSheet(`<h2>Thing to buy</h2><div class="field"><label for="we-t">What</label><input id="we-t" value="${esc(x.t)}" autocomplete="off"></div>
 <div class="field"><label for="we-p">Price ($, optional)</label><input id="we-p" type="number" inputmode="decimal" step="0.01" value="${+x.price>0?x.price:""}"></div>
 <div class="field"><label>Category</label>${opts("cat",MCATS.map(([c])=>[c,c,MICO[c]||"•"]),x.cat||"Shopping","tiles")}</div>
 <div class="field"><label>Priority</label>${opts("need",[["want","Want"],["need","Need"]],x.need?"need":"want")}</div>
 <div class="btns"><button class="action p" id="we-s">Save</button><button class="action danger" id="we-d">Remove</button></div>`,r=>{bindOpts(r);
  r.querySelector("#we-s").onclick=()=>{Object.assign(x,{t:r.querySelector("#we-t").value.trim()||x.t,price:Math.max(0,Math.round((+r.querySelector("#we-p").value||0)*100)/100),cat:optVal(r,"cat"),need:optVal(r,"need")==="need"});save();closeSheet();renderWish();toast("Saved")};
  r.querySelector("#we-d").onclick=()=>{M.wish=M.wish.filter(i=>i.id!==x.id);save();closeSheet();renderWish();toast("Removed","Undo",()=>{M.wish.push(x);save();renderWish()})}})}
function editMoney(id){const M=MO(),x=M.items.find(i=>i.id===id);if(!x)return;
 openSheet(`<h2>Edit purchase</h2><div class="pair"><div class="field"><label for="me-a">Amount ($)</label><input id="me-a" type="number" inputmode="decimal" step="0.01" value="${x.amt}"></div><div class="field"><label for="me-t">When</label><input id="me-t" type="datetime-local" value="${toLocalInput(x.ts)}"></div></div>
 <div class="field"><label>Category</label>${opts("cat",MCATS.map(([c])=>[c,c,MICO[c]||"•"]),x.cat,"tiles")}</div><div class="field"><label for="me-n">What was it?</label><input id="me-n" value="${esc(x.note||"")}"></div>
 <div class="field"><label>Paid with</label>${opts("pay",[["Card","Card"],["Cash","Cash"],["Other","Other"]],x.pay||"Card")}</div>
 <div class="btns"><button class="action p" id="me-s">Save</button><button class="action danger" id="me-d">Delete</button></div>`,r=>{bindOpts(r);
  r.querySelector("#me-s").onclick=()=>{Object.assign(x,{amt:Math.round((+r.querySelector("#me-a").value||0)*100)/100,ts:new Date(r.querySelector("#me-t").value).getTime()||x.ts,cat:optVal(r,"cat"),note:r.querySelector("#me-n").value.trim(),pay:optVal(r,"pay")});save();closeSheet();renderMoney();toast("Saved")};
  const d=r.querySelector("#me-d");d.onclick=()=>{if(!d.dataset.sure){d.dataset.sure=1;d.textContent="Tap again to delete";return}M.items=M.items.filter(i=>i.id!==x.id);save();closeSheet();renderMoney();toast("Deleted")}})}

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
  if(LN)LN.schedule({notifications:[{id:SMOKE_NOTIF_ID,title:`⏱ ${limit} minutes are up`,body:"End your session in Op-Lock In when you're done.",channelId:"tasks",smallIcon:"ic_stat_dailyhq",iconColor:"#EFBC90",extra:{kind:"smoke"},schedule:{at:new Date(Date.now()+limit*60000),allowWhileIdle:true}}]}).catch(()=>{})}}
function endSmoke(){const X=SM(),a=X.active;if(!a)return;clearTimeout(smokeLimitT);if(LN)LN.cancel({notifications:[{id:SMOKE_NOTIF_ID}]}).catch(()=>{});
 X.sessions.push({id:uid(),start:a.start,end:Date.now(),puffs:a.puffs,moods:a.moods,notes:(a.notes||"").trim()});X.active=null;save();renderSmoke();toast(`Logged · ${a.puffs} puff${a.puffs===1?"":"s"}`)}
const SMOKE_ICON={Boredom:"🥱",Stress:"😰",Anxiety:"😟",Habit:"🔁",Craving:"🧲","After eating":"🍽️","With friends":"🍻",Tired:"😴","Bad mood":"😤","Work break":"☕","Waking up":"🌅",Celebrating:"🎉"};
function editSmoke(id){const X=SM(),isNew=!id,s=isNew?{id:uid(),start:Date.now()-10*60000,end:Date.now()-5*60000,puffs:3,moods:[],notes:""}:X.sessions.find(x=>x.id===id);if(!s)return;const moods=[...(s.moods||[])];
 const LENS=[3,5,10,15],lim=S.ui.smokeLimit??5,st=smokeStats();let puffs=s.puffs||0,len=Math.max(0,Math.round(((s.end||s.start)-s.start)/60000)),when=isNew?1:-1;
 const WH=[["Now",0],["15 m ago",15],["1 h ago",60],["Pick",-1]];
 const puffRow=()=>`${[...Array(Math.max(10,puffs+1))].map((_,i)=>`<button type="button" class="smpf ${i<puffs?"f":""}" data-pf="${i}" aria-label="${i+1} puff${i?"s":""}">${i<puffs?"💨":""}</button>`).join("")}`;
 const lenLab=()=>`${len} min${lim&&len>lim?` · over your ${lim} min timer`:""}`;
 openSheet(`<h2>${isNew?"Log a session":"Edit session"}</h2><p class="desc">${isNew?"For one that already happened. No judgment.":"Fix anything that's off."}</p>
 ${isNew?`<div class="smnow"><button type="button" class="smlive" id="se-live"><span><b>Smoking right now?</b><small>Use the live timer instead</small></span><em>Start →</em></button>
  <button type="button" class="smcalm" id="se-calm"><span><b>I'm about to smoke</b><small>but I don't want to · 2 minutes of calm first</small></span><em>🧘</em></button></div>`:""}
 <div class="field"><label>When</label>${isNew?`<div class="opts" data-name="wh">${WH.map(([l],i)=>`<button type="button" data-v="${i}" class="${when===i?"on":""}">${l}</button>`).join("")}</div>`:""}<input id="se-t" type="datetime-local" value="${toLocalInput(s.start)}" ${isNew?"hidden":""}></div>
 <div class="field"><label>Puffs <b class="smn" id="se-pn">${puffs}</b></label><div class="smpuffs" id="se-pr">${puffRow()}</div></div>
 <div class="field"><label>How long <b class="smn" id="se-ln">${lenLab()}</b></label><div class="opts" data-name="len">${LENS.map(m=>`<button type="button" data-v="${m}" class="${len===m||(m===15&&len>15)?"on":""}">${m===15?"15+":m} min</button>`).join("")}</div></div>
 <div class="field"><label>What led to it? <b class="smn">optional</b></label><div class="opts tiles sm4" data-name="why">${MOODS_SMOKE.map(m=>`<button type="button" data-m="${esc(m)}" class="${moods.includes(m)?"on":""}" aria-pressed="${moods.includes(m)}"><i aria-hidden="true">${SMOKE_ICON[m]||"•"}</i>${esc(m)}</button>`).join("")}</div></div>
 <div class="field" id="se-nf" ${s.notes?"":"hidden"}><label for="se-n">Note</label><textarea id="se-n" style="min-height:70px">${esc(s.notes||"")}</textarea></div>${s.notes?"":`<button type="button" class="addl" data-show="se-nf">+ Note</button>`}
 ${isNew?`<p class="hint" style="margin-top:12px">Today so far: ${st.today.n} session${st.today.n===1?"":"s"} · ${st.today.p} puff${st.today.p===1?"":"s"}.</p>`:""}
 <div class="btns"><button class="action p" id="se-save">${isNew?"Log session":"Save"}</button>${isNew?"":`<button class="action danger" id="se-del">Delete</button>`}</div>`,root=>{
  const q=x=>root.querySelector(x);
  if(isNew){q("#se-live").onclick=()=>{closeSheet();go("smoke");startSmoke(lim)};q("#se-calm").onclick=()=>{closeSheet();openCalm()};
   root.querySelectorAll('.opts[data-name="wh"] button').forEach(b=>b.onclick=()=>{root.querySelectorAll('.opts[data-name="wh"] button').forEach(x=>x.classList.toggle("on",x===b));when=+b.dataset.v;q("#se-t").hidden=when!==3})}
  const bindP=()=>root.querySelectorAll("[data-pf]").forEach(b=>b.onclick=()=>{const i=+b.dataset.pf;puffs=puffs===i+1?i:i+1;q("#se-pr").innerHTML=puffRow();q("#se-pn").textContent=puffs;bindP();try{navigator.vibrate&&navigator.vibrate(6)}catch(e){}});bindP();
  root.querySelectorAll('.opts[data-name="len"] button').forEach(b=>b.onclick=()=>{root.querySelectorAll('.opts[data-name="len"] button').forEach(x=>x.classList.toggle("on",x===b));len=+b.dataset.v;q("#se-ln").textContent=lenLab()});
  root.querySelectorAll('.opts[data-name="why"] button').forEach(b=>b.onclick=()=>{const m=b.dataset.m,i=moods.indexOf(m);if(i>=0)moods.splice(i,1);else moods.push(m);b.classList.toggle("on",i<0);b.setAttribute("aria-pressed",i<0)});
  root.querySelectorAll("[data-show]").forEach(b=>b.onclick=()=>{const f=q("#"+b.dataset.show);f.hidden=false;b.remove();f.querySelector("textarea").focus()});
  q("#se-save").onclick=()=>{let start;if(isNew&&when>=0&&when<3)start=Date.now()-WH[when][1]*60000-len*60000;else start=new Date(q("#se-t").value).getTime()||s.start;
   Object.assign(s,{start,end:start+len*60000,puffs,moods,notes:q("#se-n").value.trim()});if(isNew)X.sessions.push(s);save();closeSheet();renderSmoke();toast(isNew?`Logged · ${puffs} puff${puffs===1?"":"s"}`:"Saved")};
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
 ["Be kind to yourself","If you smoke anyway, log it and move on. Data, not guilt. Tomorrow is a fresh streak."]];
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
function closeCalm(outcome){if(!calm){$("calm").hidden=true;document.body.style.overflow="";return}const secs=Math.round((Date.now()-calm.start)/1000),moods=calm.moods;cancelAnimationFrame(calm.raf);calm.timers.forEach(clearTimeout);clearInterval(calm.tipT);clearInterval(calm.clockT);removeEventListener("resize",calm.fit);try{calm.lock&&calm.lock.release()}catch(e){}
 calm=null;$("calm").hidden=true;document.body.style.overflow="";
 if(outcome){SM().urges.push({ts:Date.now(),outcome,secs,moods});if(outcome==="passed"){addXP(15);save();if(S.view!=="smoke")go("smoke");else renderSmoke();toast(`Urge beaten in ${mmss(secs)} · +15 XP`);burst($("calmbtn"),["#B7A3E0","#86D3B0","#EFBC90","#9FD4F7"])}
  else{save();go("smoke");startSmoke(S.ui.smokeLimit??5,moods);toast("No judgment. Logging it helps you spot patterns.")}}}
if($("calmbtn"))$("calmbtn").onclick=()=>openCalm();

/* ================= Food (merged): your intake + the dogs + recipes =================
   A food bar on Today (an original pixel drumstick bar, or a clean tracker) opens one full Food page in the
   room shell with three tabs: You (calories, protein, today's meal plan), Dogs (fed AM/PM, portions, weight,
   freezer, check-in) and Recipes. Meal calories are estimates you can edit; goals live in Food settings. */
const FO=()=>{const f=S.food;f.eat=f.eat||{};f.goal=f.goal||{kcal:2800,prot:160};f.barMode=f.barMode||"pix";f.remind=f.remind||{on:true,hours:4,start:"8:00 AM",end:"9:00 PM",lastNudge:0};return f};
const DFED=()=>{S.dogs.fed=S.dogs.fed||{};return S.dogs.fed};
const PRESET_DEFAULT=[{e:"🍌",name:"Banana",kcal:105,prot:1},{e:"🥛",name:"Greek yogurt",kcal:150,prot:15},{e:"🥜",name:"Handful of nuts",kcal:170,prot:6},{e:"🍞",name:"Toast + peanut butter",kcal:300,prot:10},{e:"🥪",name:"Sandwich",kcal:450,prot:25},{e:"🥡",name:"Takeout meal",kcal:900,prot:35}];
const PRESETS=()=>{const f=FO();if(!Array.isArray(f.presets))f.presets=PRESET_DEFAULT.map(p=>({...p}));return f.presets};
function presetSheet(){const P=PRESETS().map(p=>({...p}));
 const row=(p,i)=>`<div class="prow" data-i="${i}"><input class="pe" value="${esc(p.e||"")}" maxlength="4" aria-label="Emoji"><input class="pn" value="${esc(p.name)}" placeholder="Name" aria-label="Name"><input class="pk" type="number" inputmode="numeric" value="${p.kcal}" aria-label="Calories"><input class="pp" type="number" inputmode="numeric" value="${p.prot}" aria-label="Protein grams"><button class="prx" aria-label="Remove ${esc(p.name)}">×</button></div>`;
 openSheet(`<h2>Quick-add presets</h2><p class="desc">One tap logs it. Calories and protein (g) are estimates.</p><div class="phead"><span></span><span>Name</span><span>kcal</span><span>g</span><span></span></div><div id="plist">${P.map(row).join("")}</div>
  <button class="link" id="p-add" style="margin-top:8px">+ Add a preset</button><div class="btns"><button class="action" id="p-reset">Reset</button><button class="action p" id="p-save">Save</button></div>`,r=>{
  const read=()=>[...r.querySelectorAll(".prow")].map(x=>({e:x.querySelector(".pe").value.trim(),name:x.querySelector(".pn").value.trim(),kcal:Math.max(0,Math.round(+x.querySelector(".pk").value||0)),prot:Math.max(0,Math.round(+x.querySelector(".pp").value||0))}));
  const bindX=()=>r.querySelectorAll(".prx").forEach(b=>b.onclick=()=>b.parentElement.remove());bindX();
  r.querySelector("#p-add").onclick=()=>{r.querySelector("#plist").insertAdjacentHTML("beforeend",row({e:"🍽️",name:"",kcal:"",prot:""},0));bindX();const n=r.querySelectorAll(".pn");n[n.length-1].focus()};
  r.querySelector("#p-reset").onclick=()=>{r.querySelector("#plist").innerHTML=PRESET_DEFAULT.map(row).join("");bindX()};
  r.querySelector("#p-save").onclick=()=>{FO().presets=read().filter(p=>p.name);save();closeSheet();if(RO&&RO.kind==="food")drawRoom();toast("Presets saved")}})}
const eatLog=(k=dkey())=>FO().eat[k]||(FO().eat[k]=[]);
const ROLE_EST={breakfast:[650,40],prepA:[750,50],prepB:[800,50],drink:[600,35]};
const ROLE_ICON={breakfast:"🍳",prepA:"🥗",prepB:"🍝",drink:"🥤"};
function mealEst(role,r){if(role==="drink"&&r&&!/shake/i.test(r.name))return[0,0];return ROLE_EST[role]||[500,30]}
function todayMeals(k=dkey()){const tk=tasksFor(k);return["breakfast","prepA","drink","prepB"].map(role=>{const r=recipeFor(role,k),t=tk.find(x=>x.link===role);if(!r&&!t)return null;
  const [kc,pr]=mealEst(role,r);return{role,r,t,name:r?r.name:(t?t.t:role),label:ROLE_LABEL[role]||role,time:t&&t.time||"",kcal:kc,prot:pr,optional:!!(t&&t.optional)}}).filter(Boolean).sort((a,b)=>tmin(a.time||"11:59 PM")-tmin(b.time||"11:59 PM"))}
function foodTotals(k=dkey()){const l=eatLog(k);return{kcal:l.reduce((s,x)=>s+(+x.kcal||0),0),prot:l.reduce((s,x)=>s+(+x.prot||0),0),n:l.length}}
function lastAteTs(){const all=[...eatLog(dkey())];const y=new Date();y.setDate(y.getDate()-1);all.push(...(FO().eat[dkey(y)]||[]));return all.reduce((m,x)=>Math.max(m,x.ts||0),0)}
function sinceStrShort(ts){if(!ts)return"not yet today";const m=Math.round((Date.now()-ts)/60000);if(m<2)return"just now";if(m<60)return m+" m ago";const h=Math.floor(m/60);return h+" h "+(m%60?(m%60)+" m ":"")+"ago"}
// Hunger drains like the game: 0–20 points (10 drumsticks). You wake at 8, lose 1 point every 35 min,
// and each meal adds points by its calories (a full day's goal ≈ 28 points, so meals overlap the cap). Capped at 20.
const HUNGER_DRAIN=35,HUNGER_LOW=6;
function hungerLevel(now=Date.now()){const F=FO(),k=dkey(),ws=tmin(F.remind.start),wake=+atDate(k,ws<9998?ws:480),g=Math.max(500,+F.goal.kcal||2800);
 if(now<wake)return 8;let lvl=8,last=wake;
 for(const e of [...eatLog(k)].sort((a,b)=>a.ts-b.ts)){const t=Math.min(now,Math.max(wake,e.ts||wake));lvl=Math.max(0,lvl-(t-last)/6e4/HUNGER_DRAIN);lvl=Math.min(20,lvl+(+e.kcal||300)*20/g*1.4);last=t}
 return Math.max(0,lvl-(now-last)/6e4/HUNGER_DRAIN)}
function hungerLeft(){const m=Math.round(hungerLevel()*HUNGER_DRAIN);if(m<1)return"empty";const h=Math.floor(m/60);return(h?h+" h ":"")+(m%60?(m%60)+" m":"").trim()}
// hungry = inside your reminder window, under your calorie goal, and the bar has drained below 3 drumsticks
function isHungry(){const t=foodTotals(),g=FO().goal,R=FO().remind,m=new Date().getHours()*60+new Date().getMinutes();if(t.kcal>=g.kcal)return false;if(m<tmin(R.start)||m>tmin(R.end))return false;
 return hungerLevel()<HUNGER_LOW}
// phone alerts for eating: first one 2 h after your window opens if nothing's logged, then every N hours after your last meal, until the window closes
function foodNotifs(now){const F=FO(),R=F.remind;if(!R.on)return[];const out=[],a=tmin(R.start),b=tmin(R.end),hrs=Math.max(1,+R.hours||4);if(a>=9998||b>=9998)return out;
 for(let i=0;i<2;i++){const d=new Date();d.setDate(d.getDate()+i);const k=dkey(d),log=F.eat[k]||[],last=log.reduce((m,x)=>Math.max(m,x.ts||0),0),kc=log.reduce((s,x)=>s+(+x.kcal||0),0);if(kc>=F.goal.kcal)continue;
  const open=+atDate(k,a),end=+atDate(k,b);let t=last?last+hrs*36e5:+atDate(k,a+120);
  while(t<=end){if(t>now&&t>=open)out.push({id:nid(k+"food"+Math.round(t/6e4)),title:last?"🍗 Time to eat":"🍗 You haven't eaten today",body:last?`Last meal ${hrs}+ hours ago${kc?` · ${kc.toLocaleString()} of ${F.goal.kcal.toLocaleString()} kcal so far`:""}. Tap to log your next meal.`:"Tap to see today's meal plan and log breakfast.",schedule:{at:new Date(t),allowWhileIdle:true},channelId:"food",extra:{k,kind:"food"}});t+=hrs*36e5}}
 return out}
// in the app: a gentle nudge at most once an hour while you're hungry
function foodTick(){if(S.view==="today"&&!document.hidden)renderFoodBar();const R=FO().remind,now=Date.now();if(!R.on||document.hidden||!$("sheetwrap").hidden||RO||!isHungry())return;if(now-(R.lastNudge||0)<60*60000)return;
 R.lastNudge=now;save();if(S.view==="today"){foodNote(true);return}const la=lastAteTs();toast(eatLog().length?`🍗 Last ate ${sinceStrShort(la)}. Time to eat.`:"🍗 You haven't eaten yet today.","Log meal",()=>openFood("me"))}
// original 10x10 pixel drumstick (o outline, h highlight, m meat, d dark meat, b bone, s bone shade)
const DRUM=["...ooo....","..ohhmo...",".ohhmmmo..",".ohmmmmo..",".ommmmdo..","..ommddo..","...odoobo.","....o.obbo","......obso",".......oo."];
const DPAL={o:"#2B140A",h:"#F2A65A",m:"#C9632B",d:"#8A3A16",b:"#F1E7D0",s:"#B8AA8E"},DPALE={o:"#2B140A",h:"#3A2A22",m:"#2E211B",d:"#241914",b:"#3A332B",s:"#2C2722"};
function drumSvg(f){let r="";DRUM.forEach((row,y)=>[...row].forEach((ch,x)=>{if(ch===".")return;const full=f>=1||(f>=.5&&x>=5);r+=`<rect x="${x}" y="${y}" width="1" height="1" fill="${(full?DPAL:DPALE)[ch]}"/>`}));return`<svg viewBox="0 0 10 10" aria-hidden="true">${r}</svg>`}
function drumBar(){const f=hungerLevel()/2;return[...Array(10)].map((_,i)=>drumSvg(f-i>=1?1:f-i>=.5?.5:0)).join("")}
function dogFedPills(){const fed=DFED()[dkey()]||{};return S.dogs.list.map(d=>{const x=fed[d.id]||{};return`<span><i class="${x.am?"f":""}"></i><i class="${x.pm?"f":""}"></i>${esc(d.name)}</span>`}).join("")}
function renderFoodBar(){const el=$("foodbar");if(!el)return;const F=FO(),t=foodTotals(),g=F.goal,hungry=isHungry(),la=lastAteTs(),meals=todayMeals().filter(m=>!m.optional),low=hungerLevel()<HUNGER_LOW;
 const sw=`<button class="fbswap" id="fbswap" aria-label="${F.barMode==="pix"?"Switch to the clean food tracker":"Switch to the game food bar"}">${F.barMode==="pix"?"▤":"🍗"}</button>`;
 el.innerHTML=F.barMode==="pix"
  ?`<div class="fbline"><div class="fbpx ${low&&!RM?"hungry":""}" aria-label="Hunger bar, ${Math.round(hungerLevel()/2)} of 10">${drumBar()}</div>${sw}</div><div class="fbfoot"><span class="fbmono">${hungry?(la?"Starving. Last ate "+sinceStrShort(la):"Nothing eaten yet. Go eat!"):`${t.kcal.toLocaleString()} / ${g.kcal.toLocaleString()} · ${hungerLeft()==="empty"?"empty":"empties in "+hungerLeft()}`}</span><span class="fbdogs" id="fbdogs">${dogFedPills()}</span></div>`
  :`<div class="fbclean"><div class="fbrow"><div class="fbbig">${t.kcal.toLocaleString()}<span>/ ${g.kcal.toLocaleString()} kcal · ${t.prot} g protein</span></div><span class="${hungry?"fbwarn":"fbok"}">${hungry?"Time to eat":"Last ate "+sinceStrShort(la)}</span>${sw}</div>
   <div class="fbsegs">${meals.map(m=>`<i class="${eatLog().some(x=>x.role===m.role)?"f":""}"></i>`).join("")}</div><div class="fbfoot"><span class="fblab">${meals.map(m=>m.label.replace(/^Meal \d · /,"")).join(" · ")}</span><span class="fbdogs" id="fbdogs">${dogFedPills()}</span></div></div>`;
 $("fbswap").onclick=e=>{e.stopPropagation();F.barMode=F.barMode==="pix"?"clean":"pix";save();renderFoodBar()};
 $("fbdogs").onclick=e=>{e.stopPropagation();openFood("dogs",el)};
 el.onclick=()=>openFood("me",el);el.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openFood("me",el)}}}
function openFood(tab="me",from){const el=$("troom");if(!el)return;roomGen++;el.getAnimations().forEach(a=>a.cancel());
 const src=from&&from.getBoundingClientRect?from:$("foodbar");RO={kind:"food",tab,q:"",who:"all",origin:()=>{const r=src&&src.isConnected&&src.offsetParent!==null&&src.getBoundingClientRect();return r&&r.width&&r.bottom>0&&r.top<innerHeight?r:null}};
 const P=PAL[1];el.style.setProperty("--acc",P.road[0]);el.style.setProperty("--tbg",P.sky[0]);el.classList.remove("water");
 const d=Math.min(2,devicePixelRatio||1);paintScene($("trcv"),1,Math.round(Math.min(1800,innerWidth*d)),Math.round(340*d),23);
 drawRoom();roomShow(RO.origin())}
function logMeal(entry,el,ts){const e={id:uid(),ts:ts||Date.now(),...entry};eatLog().push(e);
 {const need=todayMeals().filter(m=>!m.optional);if(need.length&&need.every(m=>eatLog().some(x=>x.role===m.role)))earnOnce(20,"Ate all your meals","meals:"+dkey())}
 const t=entry.role&&tasksFor(dkey()).find(x=>x.link===entry.role);if(t&&!dayData(dkey()).done[t.id])toggleTask(t.id,el);else addXP(5,el);
 save();renderFoodBar();if(RO&&RO.kind==="food")drawRoom();toast(`Logged ${entry.name}${entry.kcal?" · "+entry.kcal+" kcal":""}`,"Undo",()=>{const l=eatLog(),i=l.findIndex(x=>x.id===e.id);if(i>=0)l.splice(i,1);save();renderFoodBar();if(RO&&RO.kind==="food")drawRoom()})}
// New food: tap from today's meal plan, your Food-page presets or recent meals (one or more), or describe something else.
function logFoodSheet(){const log=eatLog(),plan=todayMeals(),pre=PRESETS();
 const seen=new Set([...plan.map(m=>m.name.toLowerCase()),...pre.map(p=>p.name.toLowerCase())]),recent=[];
 for(let i=0;i<8&&recent.length<4;i++){const d=new Date();d.setDate(d.getDate()-i);[...(FO().eat[dkey(d)]||[])].sort((a,b)=>b.ts-a.ts).forEach(e=>{const n=(e.name||"").toLowerCase();if(n&&!seen.has(n)&&recent.length<4){seen.add(n);recent.push({...e,ago:i})}})}
 const sel={plan:new Set(),pre:new Set(),rec:new Set()},SZ=[["Snack",.5],["Meal",1],["Big meal",1.6]];let other=false,size=1,base=600,when=0;
 const kc=()=>Math.round(base*SZ[size][1]/10)*10,pr=()=>Math.round(kc()/20);
 const tot=()=>{let k=0,p=0;sel.plan.forEach(i=>{k+=plan[i].kcal;p+=plan[i].prot});sel.pre.forEach(i=>{k+=pre[i].kcal;p+=pre[i].prot});sel.rec.forEach(i=>{k+=+recent[i].kcal||0;p+=+recent[i].prot||0});if(other){k+=kc();p+=pr()}return{k,p}};
 const tip=(grp,i,on,icon,name,sub,dis)=>`<button type="button" class="lftile ${on?"on":""}" data-g="${grp}" data-i="${i}" ${dis?"disabled":""} aria-pressed="${on}"><i aria-hidden="true">${icon}</i><b>${esc(name)}</b><small>${sub}</small></button>`;
 const body=()=>{const t=tot();return`${plan.length?`<div class="lflab">Today's plan<b>ticks the task too</b></div><div class="lfgrid">${plan.map((m,i)=>{const ate=log.some(x=>x.role===m.role);return tip("plan",i,sel.plan.has(i),ROLE_ICON[m.role]||"🍽️",m.label.replace(/^Meal \d · /,""),ate?"✓ Ate":(m.time?m.time.replace(":00 "," ")+" · ":"")+(m.kcal||"?")+" kcal",ate)}).join("")}</div>`:""}
  <div class="lflab">Quick picks<button type="button" class="link" id="lf-pre">Edit</button></div><div class="lfgrid">${pre.map((p,i)=>tip("pre",i,sel.pre.has(i),esc(p.e||"🍽️"),p.name,p.kcal+" kcal")).join("")}</div>
  ${recent.length?`<div class="lflab">Recent</div><div class="lfgrid two">${recent.map((r,i)=>`<button type="button" class="lfrec ${sel.rec.has(i)?"on":""}" data-g="rec" data-i="${i}" aria-pressed="${sel.rec.has(i)}"><b>${esc(r.name)}</b><small>${r.kcal?r.kcal+" kcal · ":""}${r.ago===0?"today":r.ago===1?"yesterday":new Date(r.ts).toLocaleDateString([], {weekday:"short"})}</small></button>`).join("")}</div>`:""}
  ${other?`<div class="lflab">Something else</div><input class="lfin" id="lf-n" placeholder="Chicken wrap, burrito…" autocomplete="off">
   <div class="opts" data-name="sz" style="margin-top:8px">${SZ.map(([l],i)=>`<button type="button" data-v="${i}" class="${size===i?"on":""}">${l}</button>`).join("")}</div>
   <div class="lfest"><button type="button" class="lfstp" data-k="-50" aria-label="Less">−</button><span><b id="lf-k">${kc()}</b> kcal · ~<b id="lf-p">${pr()}</b> g protein</span><button type="button" class="lfstp" data-k="50" aria-label="More">+</button></div>`:`<button type="button" class="addl" id="lf-oth">+ Something else</button>`}
  <div class="lflab">When</div><div class="opts" data-name="when">${["Now","30 m ago","1 h ago","2 h ago"].map((l,i)=>`<button type="button" data-v="${i}" class="${when===i?"on":""}">${l}</button>`).join("")}</div>
  ${t.k?`<div class="lftot"><span>Logging</span><span><b>${t.k.toLocaleString()}</b> kcal · ${t.p} g protein</span></div>`:""}`};
 openSheet(`<h2>What did you eat?</h2><p class="desc">Tap one or more. Calories are estimates you can fix later.</p><div id="lf-b">${body()}</div><div class="btns"><button class="action p" id="lf-s">Pick something</button></div>`,root=>{
  const box=root.querySelector("#lf-b"),sv=root.querySelector("#lf-s");
  const paint=()=>{const nm=root.querySelector("#lf-n"),keep=nm&&nm.value;box.innerHTML=body();const n2=root.querySelector("#lf-n");if(n2&&keep)n2.value=keep;bind()};
  const btn=()=>{const t=tot();sv.textContent=t.k||other?"Log it":"Pick something";sv.disabled=!(t.k||other)};
  const bind=()=>{box.querySelectorAll("[data-g]").forEach(b=>b.onclick=()=>{const s=sel[b.dataset.g],i=+b.dataset.i;s.has(i)?s.delete(i):s.add(i);paint()});
   const o=box.querySelector("#lf-oth");if(o)o.onclick=()=>{other=true;paint();box.querySelector("#lf-n").focus()};
   const pe=box.querySelector("#lf-pre");if(pe)pe.onclick=()=>presetSheet();
   box.querySelectorAll('.opts[data-name="sz"] button').forEach(b=>b.onclick=()=>{size=+b.dataset.v;paint()});
   box.querySelectorAll('.opts[data-name="when"] button').forEach(b=>b.onclick=()=>{when=+b.dataset.v;paint()});
   box.querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>{base=Math.max(50,base+ +b.dataset.k/SZ[size][1]);paint()});btn()};
  bind();
  sv.onclick=()=>{const ts=Date.now()-[0,30,60,120][when]*60000,items=[];
   sel.plan.forEach(i=>{const m=plan[i];items.push({name:m.name,kcal:m.kcal,prot:m.prot,role:m.role})});
   sel.pre.forEach(i=>{const p=pre[i];items.push({name:p.name,kcal:p.kcal,prot:p.prot,role:""})});
   sel.rec.forEach(i=>{const r=recent[i];items.push({name:r.name,kcal:+r.kcal||0,prot:+r.prot||0,role:""})});
   if(other){const n=(root.querySelector("#lf-n").value||"").trim();if(!n){toast("What did you eat?");root.querySelector("#lf-n").focus();return}items.push({name:n,kcal:kc(),prot:pr(),role:""})}
   if(!items.length){toast("Tap something you ate");return}
   closeSheet();items.forEach((e,j)=>logMeal(e,null,ts+j));if(items.length>1)toast(`Logged ${items.length} things · ${tot().k.toLocaleString()} kcal`)}})}
function editMeal(id){if(!id)return logFoodSheet();const l=eatLog(),x=id?l.find(e=>e.id===id):null,isNew=!x,m=x||{name:"",kcal:"",prot:"",ts:Date.now()};
 openSheet(`<h2>${isNew?"Log something to eat":"Edit meal"}</h2><p class="desc">Calories and protein are estimates. Adjust them if you know better.</p>
 <div class="field"><label for="em-n">What</label><input id="em-n" value="${esc(m.name)}" placeholder="Chicken wrap, protein bar…" autocomplete="off"></div>
 <div class="pair"><div class="field"><label for="em-k">Calories</label><input id="em-k" type="number" inputmode="numeric" value="${m.kcal}" placeholder="500"></div><div class="field"><label for="em-p">Protein (g)</label><input id="em-p" type="number" inputmode="numeric" value="${m.prot}" placeholder="30"></div></div>
 <div class="field"><label for="em-t">When</label><input id="em-t" type="datetime-local" value="${toLocalInput(m.ts)}"></div>
 <div class="btns"><button class="action p" id="em-s">${isNew?"Log it":"Save"}</button>${isNew?"":`<button class="action danger" id="em-d">Delete</button>`}</div>`,
 root=>{const q=s=>root.querySelector(s);q("#em-s").onclick=()=>{const name=q("#em-n").value.trim();if(!name){toast("What did you eat?");return}const e={name,kcal:Math.max(0,Math.round(+q("#em-k").value||0)),prot:Math.max(0,Math.round(+q("#em-p").value||0))},ts=new Date(q("#em-t").value).getTime()||Date.now();
   if(isNew){closeSheet();logMeal({...e,role:""},null,ts)}else{Object.assign(x,e,{ts});save();closeSheet();renderFoodBar();toast("Saved")}};
  const dl=q("#em-d");if(dl)dl.onclick=()=>{const i=l.indexOf(x);if(i>=0)l.splice(i,1);save();closeSheet();renderFoodBar();toast("Removed")}})}
function foodGoalsSheet(){const F=FO();openSheet(`<h2>Food settings</h2><p class="desc">Your lean-bulk plan says 150–165 g protein. Set your daily calorie goal to match how you're gaining.</p>
 <div class="pair"><div class="field"><label for="fg-k">Calories a day</label><input id="fg-k" type="number" inputmode="numeric" value="${F.goal.kcal}"></div><div class="field"><label for="fg-p">Protein (g)</label><input id="fg-p" type="number" inputmode="numeric" value="${F.goal.prot}"></div></div>
 <div class="field"><label>Food bar on Today</label>${opts("bar",[["pix","Game (pixel)"],["clean","Clean tracker"]],F.barMode)}</div>
 <div class="field"><label>Remind me to eat</label>${opts("rem",[["on","On"],["off","Off"]],F.remind.on?"on":"off")}</div>
 <div class="field"><label>If I haven't logged food for</label>${opts("hrs",[["3","3 hours"],["4","4 hours"],["5","5 hours"]],String(F.remind.hours))}</div>
 <div class="pair"><div class="field"><label for="fg-a">Between</label><input id="fg-a" value="${esc(F.remind.start)}"></div><div class="field"><label for="fg-b">And</label><input id="fg-b" value="${esc(F.remind.end)}"></div></div>
 <div class="btns"><button class="action p" id="fg-s">Save</button><button class="action" id="fg-g">Grocery list</button></div>`,root=>{bindOpts(root);
 root.querySelector("#fg-s").onclick=()=>{const ra=root.querySelector("#fg-a").value.trim(),rb=root.querySelector("#fg-b").value.trim();if(tmin(ra)>=9998||tmin(rb)>=9998||tmin(rb)<=tmin(ra)){toast("Use times like 8:00 AM and 9:00 PM");return}
  Object.assign(F.remind,{on:optVal(root,"rem")==="on",hours:+optVal(root,"hrs")||4,start:ra,end:rb});F.goal={kcal:Math.max(800,Math.round(+root.querySelector("#fg-k").value||2800)),prot:Math.max(0,Math.round(+root.querySelector("#fg-p").value||160))};F.barMode=optVal(root,"bar")||F.barMode;save();closeSheet();renderFoodBar();toast("Food settings saved")};
 root.querySelector("#fg-g").onclick=()=>grocerySheet()})}
function feedBoth(slot){const k=dkey(),f=DFED(),day=f[k]||(f[k]={}),all=S.dogs.list.every(d=>day[d.id]&&day[d.id][slot]),now=Date.now();
 for(const d of S.dogs.list){const x=day[d.id]||(day[d.id]={});if(all)delete x[slot];else if(!x[slot])x[slot]=now}try{navigator.vibrate&&navigator.vibrate(all?6:[10,30,10])}catch(e){}
 save();renderFoodBar();if(RO&&RO.kind==="food")drawRoom();toast(all?"Unmarked both":`Both dogs fed · ${slot==="am"?"morning":"evening"}`)}
function feedBothHtml(fed){return`<div class="foall">${[["am","Morning"],["pm","Evening"]].map(([sl,n])=>{const all=S.dogs.list.every(d=>fed[d.id]&&fed[d.id][sl]),ts=all?Math.max(...S.dogs.list.map(d=>fed[d.id][sl])):0;
 return`<button class="foallb ${all?"f":""}" data-all="${sl}" aria-pressed="${all}"><b>${all?"✓ Both fed":"Feed both"}</b><small>${n}${all?" · "+timeStr(ts):""}</small></button>`}).join("")}</div>`}
function feedDog(id,slot,el){const k=dkey(),f=DFED(),day=f[k]||(f[k]={}),d=day[id]||(day[id]={});if(d[slot]){delete d[slot]}else{d[slot]=Date.now();try{navigator.vibrate&&navigator.vibrate(10)}catch(e){}}save();renderFoodBar();if(RO&&RO.kind==="food")drawRoom()}
function drawFoodRoom(){const R=$("troom"),F=FO(),tab=RO.tab||"me",k=dkey(),wk=typeof mealWeek==="function"?mealWeek(k):1;
 const head=`<div class="trbar"><button class="trib" id="tr-back" aria-label="Back"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg></button><span class="treb">${typeof MENU_THEMES!=="undefined"&&MENU_THEMES[wk-1]?`Week ${wk} · ${esc(MENU_THEMES[wk-1])}`:"Food"}</span><button class="trib" id="fo-set" aria-label="Food settings"><svg viewBox="0 0 24 24"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg></button></div>
 <div class="trin"><div class="fotitle">Food</div><div class="fotabs" role="tablist">${[["me","You"],["dogs","Dogs"],["rec","Recipes"]].map(([t,n])=>`<button role="tab" data-ft="${t}" class="${t===tab?"on":""}" aria-selected="${t===tab}">${n}</button>`).join("")}</div>`;
 let body="";
 if(tab==="me"){const t=foodTotals(),g=F.goal,f=t.kcal/g.kcal,RC=94.25,meals=todayMeals(),log=eatLog(),la=lastAteTs(),hungry=isHungry(),next=meals.find(m=>!m.optional&&!log.some(x=>x.role===m.role));
  body=`<div class="fohero"><div><div class="fobig">${t.kcal.toLocaleString()}<span>/ ${g.kcal.toLocaleString()} kcal</span></div><div class="trsub">${hungry?`<b class="wrbehind">${la?"Last ate "+sinceStrShort(la):"Nothing yet today"}. Time to eat.</b>`:t.kcal>=g.kcal?"Goal reached today":"Last ate "+sinceStrShort(la)}</div></div>
   <div class="trring"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,.13)" stroke-width="3"/><circle class="p" cx="18" cy="18" r="15" fill="none" stroke="var(--acc)" stroke-width="3" stroke-linecap="round" stroke-dasharray="${(Math.min(1,f)*RC).toFixed(1)} ${RC}" transform="rotate(-90 18 18)"/></svg><b>${Math.round(Math.min(1,f)*100)}%</b></div></div>
   ${F.barMode==="pix"?`<div class="fbpx foroom ${hungerLevel()<HUNGER_LOW&&!RM?"hungry":""}">${drumBar()}</div><div class="fohun">${hungerLeft()==="empty"?"Hunger bar is empty. Eat something.":"Hunger bar empties in <b>"+hungerLeft()+"</b>"}</div>`:""}
   <div class="foh4"><span>Quick add</span><button class="link" id="fo-pre">Edit</button></div>
   <div class="foquick">${PRESETS().map((p,i)=>`<button class="foqp" data-p="${i}"><i>${esc(p.e||"🍽️")}</i>${esc(p.name)}<small>${p.kcal}</small></button>`).join("")}</div>
   <div class="fomac"><div><small>Protein</small><b>${t.prot} / ${g.prot} g</b><i><em style="width:${Math.min(100,t.prot/g.prot*100)}%"></em></i></div><div><small>Meals</small><b>${meals.filter(m=>!m.optional&&log.some(x=>x.role===m.role)).length} of ${meals.filter(m=>!m.optional).length}</b><i><em style="width:${meals.length?meals.filter(m=>!m.optional&&log.some(x=>x.role===m.role)).length/Math.max(1,meals.filter(m=>!m.optional).length)*100:0}%"></em></i></div><div><small>Logged</small><b>${log.length} today</b><i><em style="width:0"></em></i></div></div>
   <div class="foh4"><span>Today's meal plan</span><button class="link" id="fo-add">+ Something else</button></div>
   ${meals.map(m=>{const done=log.find(x=>x.role===m.role);return`<div class="fomeal ${done?"done":m===next?"next":""}"><i>${ROLE_ICON[m.role]||"🍽️"}</i><div class="m">${esc(m.name)}<small>${esc(m.label)}${m.time?" · "+esc(m.time):""}${m.kcal?` · ~${m.kcal} kcal · ${m.prot} g`:""}${m.optional?" · if intake is low":""}</small></div>${m.r?`<button class="forec" data-r="${m.r.id}">Recipe</button>`:""}<button class="fogo" data-role="${m.role}">${done?"✓ Ate":"Ate it"}</button></div>`}).join("")||`<p class="trmin">No meal plan for today.</p>`}
   <button class="forem" id="fo-rem" aria-pressed="${F.remind.on}"><span>Remind me to eat<small>${F.remind.on?`If I haven't logged food in ${F.remind.hours} hours · ${esc(F.remind.start)}–${esc(F.remind.end)}`:"Off"}</small></span><i class="${F.remind.on?"on":""}"></i></button>
   ${log.length?`<div class="foh4"><span>Eaten today</span><span>${t.kcal.toLocaleString()} kcal · ${t.prot} g</span></div>${[...log].sort((a,b)=>a.ts-b.ts).map(x=>`<button class="folog" data-id="${x.id}"><span>${esc(x.name)}<small>${timeStr(x.ts)}${x.kcal?" · "+x.kcal+" kcal":""}${x.prot?" · "+x.prot+" g protein":""}</small></span><b>✎</b></button>`).join("")}`:""}`}
 if(tab==="dogs"){const fed=DFED()[k]||{},D=S.dogs;
  body=feedBothHtml(fed)+D.list.map(d=>{const s=dogStatus(d),p=dogPortions(d,s.fresh),x=fed[d.id]||{},w=dogCurrentWeight(d);
   return`<div class="fodog ${s.urgent.length?"alert":""}"><div class="fodh"><div><b>${esc(d.name)}</b><small>${w>0?w+" lb":"Weight not set"}${d.sensitive?" · settling stomach":""}${d.goal==="lose"?" · losing weight":""}</small></div><span class="fochk ${s.logged?"ok":""}">${s.logged?"✓ Checked in":"Check-in at 9 PM"}</span></div>
    <div class="fofeeds">${[["am","Morning"],["pm","Evening"]].map(([sl,n])=>`<button class="fofeed ${x[sl]?"f":""}" data-dog="${d.id}" data-slot="${sl}" aria-pressed="${!!x[sl]}"><b>${n}</b><small>${x[sl]?"Fed at "+timeStr(x[sl]):"Tap when fed"}</small></button>`).join("")}</div>
    ${p?`<div class="foport"><span>Per meal: <b>${cupStr(p.kibCup/2)} kibble</b> + ${r5(p.freshG/2)} g fresh</span><span>${100-s.fresh}/${s.fresh}</span></div>`:`<div class="trmin">Add ${esc(d.name)}'s weight to see portions.</div>`}
    ${p?dogWeightLine(d):""}${s.urgent.map(u=>`<div class="flag urgent">⚠ ${esc(u)}. Call your vet.</div>`).join("")}${s.watch.map(u=>`<div class="flag">${esc(u)}</div>`).join("")}</div>`}).join("")
   +`<div class="fomini"><div><small>Freezer bags</small><b>${D.freezer||0}</b><div class="foctl"><button id="fz-m" aria-label="Use one bag">−1</button><button id="fz-p" aria-label="Add one bag">+1</button><button id="fz-b">+ Batch</button></div></div><div><small>One batch lasts</small><b>${(()=>{const bd=batchDays();return bd?"≈ "+Math.floor(bd)+" days":"–"})()}</b><small style="margin-top:6px">at today's ratios</small></div></div>
   <button class="fowide p" id="dg-check">Daily check-in · food, water, stool, energy</button><button class="fowide" id="dg-wheel">🎡 Build-a-bowl wheel</button><div class="fotwo"><button class="fowide" id="dg-rec">Meal-prep recipe</button><button class="fowide" id="dg-edit">Names and weights</button></div>
   <details class="foflags"><summary>Red flags</summary><p>${esc(DOG_FLAGS)}</p></details>`}
 if(tab==="rec"){const m=recMenu(wk);body=m.html;RO._list=m.list}
 $("trs").innerHTML=head+`<div class="fobody">${body}</div></div>`;$("trfoot").innerHTML="";
 const q=s=>R.querySelector(s);q("#tr-back").onclick=()=>closeRoom();q("#fo-set").onclick=()=>foodGoalsSheet();
 R.querySelectorAll("[data-ft]").forEach(b=>b.onclick=()=>{RO.tab=b.dataset.ft;drawRoom();$("trs").scrollTo({top:Math.min($("trs").scrollTop,170)})});
 R.querySelectorAll(".fogo").forEach(b=>b.onclick=()=>{const role=b.dataset.role,l=eatLog(),ex=l.findIndex(x=>x.role===role);if(ex>=0){l.splice(ex,1);save();renderFoodBar();drawRoom();return}
  const m=todayMeals().find(x=>x.role===role);if(m)logMeal({name:m.name,kcal:m.kcal,prot:m.prot,role},b)});
 R.querySelectorAll(".forec,.forc").forEach(b=>b.onclick=()=>openRecipe(b.dataset.r));
 R.querySelectorAll(".foqp").forEach(b=>{let lp=0,t=null;b.onpointerdown=()=>{lp=0;t=setTimeout(()=>{lp=1;presetSheet()},550)};b.onpointerup=b.onpointerleave=b.onpointercancel=()=>clearTimeout(t);
  b.onclick=()=>{if(lp)return;const p=PRESETS()[+b.dataset.p];if(p)logMeal({name:p.name,kcal:p.kcal,prot:p.prot,role:""},b)}});const pe=q("#fo-pre");if(pe)pe.onclick=()=>presetSheet();
 R.querySelectorAll(".folog").forEach(b=>b.onclick=()=>editMeal(b.dataset.id));const rm=q("#fo-rem");if(rm)rm.onclick=()=>{F.remind.on=!F.remind.on;save();drawRoom();toast(F.remind.on?"Eat reminders on":"Eat reminders off")};const ad=q("#fo-add");if(ad)ad.onclick=()=>editMeal();
 R.querySelectorAll(".fofeed").forEach(b=>b.onclick=()=>feedDog(b.dataset.dog,b.dataset.slot,b));R.querySelectorAll("[data-all]").forEach(b=>b.onclick=()=>feedBoth(b.dataset.all));
 const fz=n=>{S.dogs.freezer=Math.max(0,(S.dogs.freezer||0)+n);save();drawRoom()};if(q("#fz-m")){q("#fz-m").onclick=()=>fz(-1);q("#fz-p").onclick=()=>fz(1);
  q("#fz-b").onclick=()=>openSheet(`<h2>Add a batch</h2><p class="desc">How many bags went into the freezer?</p><div class="field"><label for="fz-n">Bags</label><input id="fz-n" type="number" inputmode="numeric" value="7"></div><div class="btns"><button class="action p" id="fz-save">Add bags</button></div>`,r=>{r.querySelector("#fz-save").onclick=()=>{const n=Math.round(+r.querySelector("#fz-n").value);if(!(n>0)){toast("Enter how many bags");return}closeSheet();fz(n);toast(n+" bags added to the freezer")}})}
 if(q("#dg-check")){q("#dg-check").onclick=()=>dogCheckIn();q("#dg-rec").onclick=()=>{const r=S.food.recipes.find(x=>x.name===HUSKY_RECIPE.name);if(r)openRecipe(r.id)};q("#dg-edit").onclick=()=>dogEdit()}
 const fq=q("#fo-q");if(fq)fq.oninput=()=>{RO.q=fq.value;const pos=fq.selectionStart;drawRoom();const n=$("fo-q");if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(e){}}};
 R.querySelectorAll("[data-who]").forEach(b=>b.onclick=()=>{RO.who=b.dataset.who;RO.pick=null;drawRoom()});const nw=q("#fo-new");if(nw)nw.onclick=()=>{S.ui.who=RO.who==="dog"?"dog":"me";editRecipe()};
 R.querySelectorAll("[data-mt]").forEach(b=>b.onclick=()=>{RO.mt=b.dataset.mt;RO.pick=null;drawRoom()});
 R.querySelectorAll(".fodish").forEach(b=>b.onclick=()=>openRecipe(b.dataset.r));
 R.querySelectorAll("[data-pick]").forEach(b=>b.onclick=()=>{const p=pickRecipe(b.dataset.pick,RO._list||[],wk);if(!p){toast("No recipes in this tab yet");return}RO.pick={id:p.r.id,mode:b.dataset.pick,why:p.why};RO.pickAnim=!RM;drawRoom();$("trs").scrollTo({top:Math.min($("trs").scrollTop,140),behavior:RM?"auto":"smooth"})});
 if(q("#fp-x")){q("#fp-x").onclick=()=>{RO.pick=null;drawRoom()};q("#fp-again").onclick=()=>{const p=pickRecipe(RO.pick.mode,RO._list||[],wk);if(p){RO.pick={id:p.r.id,mode:RO.pick.mode,why:p.why};RO.pickAnim=!RM;drawRoom()}};q("#fp-cook").onclick=()=>openRecipe(RO.pick.id)}
 if(RO.pickAnim){RO.pickAnim=false;const el=q("#fp-name"),names=(RO._list||[]).map(r=>r.name),fin=el&&el.textContent,card=q(".fopick");if(el&&names.length>1){card.classList.add("spin");let n=0;const iv=setInterval(()=>{if(!el.isConnected){clearInterval(iv);return}el.textContent=names[Math.floor(Math.random()*names.length)];if(++n>12){clearInterval(iv);el.textContent=fin;card.classList.remove("spin")}},70)}}
 const bw=q("#fo-wheel");if(bw)bw.onclick=()=>dogWheel();const bw2=q("#dg-wheel");if(bw2)bw2.onclick=()=>dogWheel()}
/* ---- recipes as a menu: tabs by meal, sections by main food ---- */
const MENU_TABS={me:[["Breakfast","Breakfast"],["Mains","Meal prep"],["Drinks","Drinks"],["Lessons","Lessons"],["Other","Other"]],dog:[["Meals","Meal"],["Toppers","Topper"],["Treats","Treat"]]};
const SEC_ORDER=["This week","Chicken","Beef","Seafood","Turkey","Eggs","Shakes","Refreshers","Frozen","Baked","Other","Results"];
function mainFood(r){const n=r.name.toLowerCase(),all=n+" "+(r.ingredients||[]).join(" ").toLowerCase();
 if(r.cat==="Drinks")return/shake|smoothie/.test(n)?"Shakes":"Refreshers";
 if(r.who==="dog"&&r.cat==="Treat")return/frozen|freeze/.test(all)?"Frozen":/bake|biscuit|oven/.test(all)?"Baked":"Other";
 const T=[["Seafood",/salmon|shrimp|fish|cod|tuna|sardine/],["Beef",/steak|beef/],["Chicken",/chicken/],["Turkey",/turkey/],["Eggs",/\beggs?\b/]];
 for(const s of[n,all])for(const[lab,re]of T)if(re.test(s))return lab;return"Other"}
function recKcal(r){return r.who!=="dog"&&ROLE_EST[r.role]?mealEst(r.role,r):null}
function recMenu(wk){const who=RO.who==="dog"?"dog":"me",tabs=MENU_TABS[who],q=(RO.q||"").trim().toLowerCase();
 const mt=tabs.some(t=>t[1]===RO.mt)?RO.mt:(who==="dog"?"Meal":"Meal prep");RO.mt=mt;
 const pool=S.food.recipes.filter(r=>(r.who||"me")===who),catOf=r=>who==="me"?(FOOD_CATS.me.includes(r.cat)?r.cat:"Other"):(FOOD_CATS.dog.includes(r.cat)?r.cat:"Meal");
 const list=(q?pool.filter(r=>(r.name+" "+(r.ingredients||[]).join(" ")).toLowerCase().includes(q)):pool.filter(r=>catOf(r)===mt))
  .sort((a,b)=>((b.week===wk)-(a.week===wk))||((b.fav?1:0)-(a.fav?1:0))||((a.week||9)-(b.week||9))||a.name.localeCompare(b.name));
 const secs={};list.forEach(r=>{const s=q?"Results":mainFood(r);(secs[s]=secs[s]||[]).push(r)});
 const order=Object.keys(secs).sort((a,b)=>(SEC_ORDER.indexOf(a)+99)%99-(SEC_ORDER.indexOf(b)+99)%99);
 const pk=RO.pick&&S.food.recipes.find(r=>r.id===RO.pick.id);
 const row=r=>{const e=recKcal(r),meta=who==="dog"?[r.time,r.serves].filter(Boolean).join(" · "):(r.ingredients||[]).slice(0,4).map(x=>x.replace(/\s*\(.*?\)/g,"")).join(" · ");
  return`<button class="fodish" data-r="${r.id}"><span class="dl"><b>${esc(r.name)}${who==="me"&&r.week===wk?`<em class="fowk">This week</em>`:""}</b><i></i><span>${e&&e[0]?"~"+e[0]+" kcal":r.fav?"★":""}</span></span><span class="dd">${esc(meta)}</span></button>`};
 const theme=typeof MENU_THEMES!=="undefined"&&MENU_THEMES[wk-1];
 const html=`<div class="fochips">${[["me","You"],["dog","Dogs"]].map(([w,n])=>`<button data-who="${w}" class="${w===who?"on":""}">${w==="dog"?"🐕 ":""}${n}</button>`).join("")}<button id="fo-new" class="fonew">+ New recipe</button></div>
  <div class="fosearch" style="margin-top:10px"><input id="fo-q" type="search" value="${esc(RO.q||"")}" placeholder="Search ${who==="dog"?"dog recipes":"recipes or ingredients"}" autocomplete="off" aria-label="Search recipes"></div>
  ${q?"":`<div class="fomt" role="tablist">${tabs.map(([n,c])=>`<button role="tab" data-mt="${c}" class="${c===mt?"on":""}" aria-selected="${c===mt}">${n}</button>`).join("")}</div>`}
  <div class="fopk"><button data-pick="rand" class="r">🎲 Random<small>Any ${q?"result":tabs.find(t=>t[1]===mt)[0].toLowerCase()}</small></button><button data-pick="choose" class="c">✨ Choose for me<small>${who==="dog"?"Gentle, favorites first":"This week, not eaten lately"}</small></button></div>
  ${who==="dog"?`<button class="fowheel" id="fo-wheel"><span class="fwi" aria-hidden="true">🎡</span><span><b>Build-a-bowl wheel</b><small>Spin a protein, a carb and a veg, all dog-safe</small></span><em>Spin →</em></button>`:""}
  ${pk?`<div class="fopick"><div class="why">${RO.pick.mode==="choose"?"Chosen for you":"Random pick"}</div><div class="fpname" id="fp-name">${esc(pk.name)}</div><div class="fpmeta">${esc((RO.pick.why&&RO.pick.why.length?RO.pick.why:[pk.cat||""]).join(" · "))}</div><div class="fpacts"><button id="fp-x" aria-label="Close the pick">✕</button><button id="fp-again">Another</button><button class="p" id="fp-cook">Cook this →</button></div></div>`:""}
  <div class="fomenu"><div class="fmh">${who==="dog"?"The Dog Bowl":q?"Search":esc(tabs.find(t=>t[1]===mt)[0])}</div><div class="fms">${who==="dog"?"Plain, cooked, no seasoning · ever":theme?`Week ${wk} · ${esc(theme)}`:"Your recipes"}</div>
   ${order.map(s=>`<div class="fosec"><h5>${esc(s)}</h5>${secs[s].map(row).join("")}</div>`).join("")||`<p class="trmin" style="text-align:center">${q?"No recipes match.":"Nothing here yet. Tap + New recipe."}</p>`}</div>
  ${who==="dog"?`<details class="foflags"><summary>Never feed dogs</summary><p>${typeof DOG_SAFE!=="undefined"?DOG_SAFE:""}</p></details>`:""}`;
 return{html,list}}
function pickRecipe(mode,list,wk){if(!list.length)return null;const eaten=new Set();for(let i=0;i<7;i++){const d=new Date();d.setDate(d.getDate()-i);(FO().eat[dkey(d)]||[]).forEach(e=>eaten.add((e.name||"").toLowerCase()))}
 const prev=RO.pick&&RO.pick.id,c=list.length>1?list.filter(r=>r.id!==prev):list;
 if(mode==="rand")return{r:c[Math.floor(Math.random()*c.length)],why:[]};
 const soft=S.dogs&&S.dogs.list.some(d=>d.sensitive);
 return c.map(r=>{const why=[];let s=Math.random()*1.5;
  if(r.who==="dog"){if(r.fav){s+=2;why.push("A favorite")}if(soft&&/rice|plain|pumpkin/i.test(r.name+" "+(r.ingredients||[]).join(" "))){s+=2;why.push("Gentle on a settling stomach")}}
  else{if(r.week===wk){s+=3;why.push("On this week's menu")}if(eaten.has(r.name.toLowerCase()))s-=5;else why.push("Not eaten in the last 7 days");const e=recKcal(r);if(e&&e[1]){s+=e[1]/20;why.push("~"+e[1]+" g protein")}if(r.fav){s+=1;why.push("A favorite")}}
  return{r,s,why}}).sort((a,b)=>b.s-a.s)[0]}
/* ---- build-a-bowl wheel for the dogs: three rings (protein, carb, veg), all plain and dog-safe ---- */
const BOWL=[[["🦃","Turkey (93% lean)","3 lb 93% lean ground turkey"],["🐔","Chicken breast","3 lb boneless, skinless chicken breast"],["🥩","Lean beef","3 lb lean ground beef (90% or leaner)"],["🐟","White fish","3 lb boneless white fish (cod or pollock)"],["🍣","Salmon","3 lb boneless salmon, fully cooked"],["🥚","Eggs","12 eggs"]],
 [["🍚","White rice","4 cups cooked white rice"],["🍠","Sweet potato","4 cups cooked, mashed sweet potato (peeled)"],["🥣","Oats","4 cups plain cooked oats"],["🎃","Pumpkin","2 cups pure pumpkin purée + 2 cups cooked rice"],["🍙","Brown rice","4 cups cooked brown rice"],["🥔","Potato","4 cups cooked, peeled potato"]],
 [["🌿","Green beans","2 cups green beans"],["🥕","Carrots","2 cups carrots"],["🫛","Peas","2 cups peas"],["🥒","Zucchini","2 cups zucchini"],["🥦","Broccoli","1 cup broccoli (small amounts only)"],["🥬","Spinach","1 cup spinach (small amounts only)"]]];
const BOWL_TOP=["a few blueberries","a spoon of plain pumpkin","a spoon of plain unsweetened yogurt","one sardine (in water, no salt)","nothing extra this time"];
const BOWL_STEP=[i=>[["Cook the turkey in a pan with no oil and no seasoning, then drain the fat"],["Boil or bake the chicken plain until fully cooked, then shred and check for bones"],["Brown the beef with no oil or seasoning, then drain the fat well"],["Bake or poach the fish plain until it flakes, then check carefully for bones"],["Bake the salmon plain until fully cooked (never raw), then flake and remove every bone"],["Hard-boil or scramble the eggs plain (no butter or oil), then chop"]][i][0],
 i=>[["Cook the rice in plain water"],["Peel, dice and boil the sweet potato until soft, then mash"],["Cook the oats in plain water"],["Use pure pumpkin purée (not pie filling) and mix it with plain cooked rice"],["Cook the brown rice in plain water until very soft"],["Peel, dice and boil the potato until soft (never raw or green potato)"]][i][0],
 i=>"Steam or boil the "+BOWL[2][i][1].toLowerCase()+" until soft, then chop or mash small"];
let BW=null;
function bowlSector(r0,r1,a0,a1){const p=(r,a)=>{const t=(a-90)*Math.PI/180;return[(100+r*Math.cos(t)).toFixed(2),(104+r*Math.sin(t)).toFixed(2)]};const[x0,y0]=p(r1,a0),[x1,y1]=p(r1,a1),[x2,y2]=p(r0,a1),[x3,y3]=p(r0,a0);return`M${x0} ${y0}A${r1} ${r1} 0 0 1 ${x1} ${y1}L${x2} ${y2}A${r0} ${r0} 0 0 0 ${x3} ${y3}Z`}
function dogWheel(){if(!BW)BW={rot:[0,0,0],idx:[0,0,0],lock:[false,false,false],top:0,spun:false};
 const RG=[[68,98,15,83],[40,68,13,54],[12,40,11,26]],FILL=[["rgba(233,162,94,.30)","rgba(233,162,94,.14)"],["rgba(255,255,255,.12)","rgba(255,255,255,.05)"],["rgba(134,211,176,.26)","rgba(134,211,176,.12)"]];
 const svg=`<svg viewBox="0 0 200 206" class="bwsvg" aria-hidden="true">${BOWL.map((ring,k)=>{const[r0,r1,fs,rl]=RG[k],n=ring.length,step=360/n;
  return`<g id="bw${k}" style="transform-origin:100px 104px;transform:rotate(${BW.rot[k]}deg)">${ring.map((it,i)=>{const a=i*step,c=(a+step/2-90)*Math.PI/180;return`<path d="${bowlSector(r0,r1,a,a+step)}" fill="${FILL[k][i%2]}" stroke="#140C08" stroke-width="1.2"/><text x="${(100+rl*Math.cos(c)).toFixed(1)}" y="${(104+rl*Math.sin(c)).toFixed(1)}" font-size="${fs}" text-anchor="middle" dominant-baseline="central" transform="rotate(${a+step/2} ${(100+rl*Math.cos(c)).toFixed(1)} ${(104+rl*Math.sin(c)).toFixed(1)})">${it[0]}</text>`}).join("")}</g>`}).join("")}
  <circle cx="100" cy="104" r="11" fill="#2A170C" stroke="var(--acc,#E9A25E)" stroke-width="1.5"/><text x="100" y="104.5" font-size="10" text-anchor="middle" dominant-baseline="central">🐕</text><path d="M92 0h16l-8 15z" fill="var(--acc,#E9A25E)" stroke="#140C08" stroke-width="1.2"/></svg>`;
 const res=()=>BW.spun?`${["Protein","Carb","Veg"].map((n,k)=>`<button class="bwr ${BW.lock[k]?"lk":""}" data-l="${k}" aria-pressed="${BW.lock[k]}"><small>${n}${BW.lock[k]?" · locked":""}</small><b>${BOWL[k][BW.idx[k]][0]} ${esc(BOWL[k][BW.idx[k]][1])}</b></button>`).join("")}`:`<p class="desc" style="grid-column:1/-1;text-align:center;margin:0">Spin to build a bowl. Tap a result to lock it, then spin the rest.</p>`;
 openSheet(`<h2>Build-a-bowl wheel</h2><div class="bwwrap">${svg}</div><div class="bwres" id="bw-res">${res()}</div><p class="bwtop" id="bw-top">${BW.spun?"Topper idea: "+esc(BOWL_TOP[BW.top]):""}</p>
  <p class="desc bwsafe">Cook everything plain: no salt, oil, onion, garlic or seasoning. Change one ingredient at a time from what they eat now, and watch their stool for 2–3 days. It's a topper over kibble, not a complete diet.</p>
  <div class="btns"><button class="action" id="bw-save" ${BW.spun?"":"disabled"}>Save as recipe</button><button class="action p" id="bw-spin">Spin</button></div>`,r=>{
  let busy=false;const paint=()=>{r.querySelector("#bw-res").innerHTML=res();r.querySelector("#bw-top").textContent=BW.spun?"Topper idea: "+BOWL_TOP[BW.top]:"";r.querySelector("#bw-save").disabled=!BW.spun;bindL()};
  const bindL=()=>r.querySelectorAll(".bwr").forEach(b=>b.onclick=()=>{if(busy)return;const k=+b.dataset.l;BW.lock[k]=!BW.lock[k];paint()});bindL();
  r.querySelector("#bw-spin").onclick=()=>{if(busy)return;if(BW.lock.every(Boolean)){toast("Unlock a ring to spin it");return}busy=true;let longest=0;
   BOWL.forEach((ring,k)=>{if(BW.lock[k])return;const n=ring.length,step=360/n;let i=Math.floor(Math.random()*n);if(i===BW.idx[k]&&BW.spun)i=(i+1+Math.floor(Math.random()*(n-1)))%n;BW.idx[k]=i;
    const target=-(i+.5)*step,turns=3+k,base=BW.rot[k]+turns*360;BW.rot[k]=base+(((target-base)%360)+360)%360;const dur=RM?0:1.5+k*.45;longest=Math.max(longest,dur);
    const g=r.querySelector("#bw"+k);g.style.transition=RM?"none":`transform ${dur}s cubic-bezier(.12,.75,.18,1)`;g.style.transform=`rotate(${BW.rot[k]}deg)`});
   BW.top=Math.floor(Math.random()*BOWL_TOP.length);try{navigator.vibrate&&navigator.vibrate(8)}catch(e){}
   r.querySelectorAll(".bwr:not(.lk) b").forEach(b=>b.textContent="…");
   setTimeout(()=>{busy=false;BW.spun=true;if(r.isConnected)paint();try{navigator.vibrate&&navigator.vibrate([10,40,10])}catch(e){}},longest*1000+80)};
  r.querySelector("#bw-save").onclick=()=>{if(!BW.spun||busy)return;const[P,C,V]=BOWL.map((ring,k)=>ring[BW.idx[k]]),clean=s=>s.replace(/\s*\(.*?\)/g,"");
   const rec={id:uid(),who:"dog",cat:"Meal",name:`${clean(P[1])}, ${clean(C[1]).toLowerCase()} and ${V[1].toLowerCase()} bowl`,time:"About 1 hour",serves:"One batch of toppers",protein:"",fav:false,ts:Date.now(),
    ingredients:[P[2],C[2],V[2],"Plain water"],steps:[BOWL_STEP[0](BW.idx[0]),BOWL_STEP[1](BW.idx[1]),BOWL_STEP[2](BW.idx[2]),"Mix everything with a little warm water until moist","Let it cool completely","Portion into freezer bags, flatten them and label with the date","Keep about 3 days in the fridge and freeze the rest"],
    notes:`Built on the bowl wheel. Topper idea: ${BOWL_TOP[BW.top]}.\n\nNo salt, oil, onion, garlic, broth or seasoning. This is a topper over kibble, not a complete diet. Switch one ingredient at a time and watch stool for 2–3 days before the next change.`};
   S.food.recipes.push(rec);save();closeSheet();if(RO&&RO.kind==="food"){RO.tab="rec";RO.who="dog";RO.mt="Meal";RO.q="";drawRoom()}toast("Saved to dog recipes","Open",()=>openRecipe(rec.id))}})}

/* ================= Streak · Coach · Rewards =================
   Coins 🪙 are earned for discipline (they ride along with XP, plus bonuses for clearing a day, the water goal,
   eating all meals and streak milestones) and spent in a Store. Streak tiers unlock bigger rewards. The Coach
   reads the last 30 days and explains what keeps breaking your streak, with one-tap schedule fixes. */
const RW=()=>{if(!S.rw)S.rw={coins:Math.max(0,S.xp||0),ledger:S.xp?[{ts:Date.now(),amt:S.xp,label:"Starting balance from your XP"}]:[],got:{},items:[],fixes:{}};const r=S.rw;r.ledger=r.ledger||[];r.got=r.got||{};r.items=r.items||[];r.fixes=r.fixes||{};return r};
const TIERS=[["Diamond",100,"💎"],["Gold",30,"🥇"],["Silver",7,"🥈"],["Bronze",3,"🥉"]];
const tierOf=s=>TIERS.find(t=>s>=t[1])||["Starter",0,"🔥"];
const TIER_DAYS={Starter:0,Bronze:3,Silver:7,Gold:30,Diamond:100};
const MILES=[[3,100],[7,300],[14,500],[30,1000],[60,1500],[100,2000],[180,3000],[365,5000]];
const XP_LABEL={10:"Task done",[-10]:"Task unchecked",5:"Logged an entry",[-5]:"Entry removed",15:"Beat a smoke urge"};
function earn(n,label){if(!n)return;const r=RW(),L=r.ledger,last=L[L.length-1];
 if(last&&last.amt===-n&&Date.now()-last.ts<90000&&(XP_LABEL[-n]===last.label||label===XP_LABEL[n])){L.pop();r.coins=Math.max(0,r.coins+n);return} // quick undo cancels out
 r.coins=Math.max(0,r.coins+n);L.push({ts:Date.now(),amt:n,label});if(L.length>400)L.splice(0,L.length-400);renderStreakChip()}
function earnOnce(n,label,key){const r=RW();if(r.got[key])return;r.got[key]=1;earn(n,label)}
function unearn(n,label,key){const r=RW();if(!r.got[key])return;delete r.got[key];earn(-n,label)}
function checkMilestones(){const s=streak();for(const [d,bonus] of MILES)if(s>=d&&!RW().got["mile:"+d]){earnOnce(bonus,`Milestone: ${d}-day streak`,"mile:"+d);setTimeout(()=>toast(`🏆 ${d}-day streak! +${bonus} 🪙`),400)}}
function renderStreakChip(){const l=$("streaklbl");if(l)l.textContent=streak()+(streak()===1?" day":" days")}
// ---- store ----
const STORE_DEFAULT=[
 {id:"d1",c:"Do",ic:"🎮",n:"1 hour of gaming",d:"Guilt-free",p:200,t:"Bronze"},{id:"d2",c:"Do",ic:"🎬",n:"Movie night",d:"Phone off, full movie",p:250,t:"Bronze"},
 {id:"d3",c:"Do",ic:"🍔",n:"Cheat meal",d:"One meal, anything you want",p:350,t:"Bronze"},{id:"d4",c:"Do",ic:"😴",n:"Sleep in",d:"Skip the early alarm once",p:300,t:"Silver"},
 {id:"d5",c:"Do",ic:"🏖️",n:"Full day off",d:"No routine, no guilt",p:1500,t:"Gold"},{id:"t1",c:"Treat",ic:"🍦",n:"Dessert",d:"Any dessert you want",p:150,t:"Starter"},
 {id:"t2",c:"Treat",ic:"☕",n:"Fancy coffee",d:"The good one",p:100,t:"Starter"}];
const COINS_PER_DOLLAR=20;
function storeItems(){const r=RW(),wish=(MO().wish||[]).filter(x=>+x.price>0).map(x=>({id:"w:"+x.id,c:"Buy",ic:"🛍️",n:x.title,d:`From Things to buy · ${money(+x.price)}`,p:Math.round(+x.price*COINS_PER_DOLLAR),t:+x.price<100?"Bronze":+x.price<200?"Silver":"Gold",wish:true}));
 return[...STORE_DEFAULT.filter(x=>!(r.hidden||{})[x.id]),...r.items.map(x=>({...x,custom:true})),...wish]}
// ---- coach ----
function coachData(){const today=dkey(),days=[],t0=startDay();for(let i=1;i<=30;i++){const d=new Date();d.setDate(d.getDate()-i);const k=dkey(d);if(k<t0)break;const req=tasksFor(k).filter(x=>!x.optional);if(!req.length)continue;
  const dd=S.days[k]||{done:{}},miss=req.filter(x=>!dd.done[x.id]);days.push({k,dow:dowOf(k),req,miss})}
 const tasks={};for(const d of days)for(const t of d.miss){const e=tasks[t.id]||(tasks[t.id]={id:t.id,t:t.t,time:t.time||"",g:t.g,miss:0,only:0,wk:0,recent:0,rep:!!t.rep});e.miss++;if(d.miss.length===1)e.only++;if(d.dow===0||d.dow===6)e.wk++;if(days.indexOf(d)<14)e.recent++}
 const cleared=days.filter(d=>!d.miss.length).length,by1=days.filter(d=>d.miss.length===1).length,by23=days.filter(d=>d.miss.length>=2&&d.miss.length<=3).length,by4=days.filter(d=>d.miss.length>=4).length;
 const allMiss=days.flatMap(d=>d.miss),bucket={morning:0,afternoon:0,evening:0,anytime:0};for(const t of allMiss){const m=tmin(t.time);bucket[m>=9998?"anytime":m<720?"morning":m<1020?"afternoon":"evening"]++}
 const top=Object.values(tasks).sort((a,b)=>b.only-a.only||b.miss-a.miss);
 const safe=new Map();for(const d of days.slice(0,14))for(const t of d.req)if(!d.miss.includes(t))safe.set(t.id,(safe.get(t.id)||0)+1);
 const working=[...new Set(days.slice(0,14).flatMap(d=>d.req).filter(t=>!Object.prototype.hasOwnProperty.call(tasks,t.id)||tasks[t.id].recent===0).map(t=>t.t))].slice(0,4);
 return{days,cleared,missed:days.length-cleared,by1,by23,by4,bucket,total:allMiss.length,top,working}}
function crowd(t){const T=tmin(t.time);if(T>=9998)return[];return tasksFor(dkey()).filter(x=>x.id!==t.id&&x.time&&Math.abs(tmin(x.time)-T)<=45&&!x.optional).map(x=>x.t).slice(0,2)}
const fmtMin=m=>{m=((m%1440)+1440)%1440;const h=Math.floor(m/60),mm=m%60;return`${h%12||12}:${String(mm).padStart(2,"0")} ${h<12?"AM":"PM"}`};
function coachInsights(){const C=coachData(),out=[];if(C.days.length<3)return{C,out};
 for(const e of C.top.slice(0,3)){if(e.miss<2)continue;const T=tmin(e.time),near=crowd(e),why=[],fixes=[];
  const share=C.days.length?Math.round(e.miss/Math.min(14,C.days.length)*100):0;
  if(e.wk>=Math.max(2,e.miss*.7)){why.push(`almost all of these misses are on weekends, when your mornings start later`);fixes.push(["weekend","Optional on weekends"])}
  if(T<9998&&T<420){why.push(`${e.time} is very early, so it's easy to sleep through or skip`);fixes.push(["anytime","Make it Anytime"])}
  if(T>=1200){why.push(`it's late in the evening, when energy and willpower are lowest`);fixes.push(["move:"+(T-180),"Move to "+fmtMin(T-180)])}
  if(near.length)why.push(`it shares a busy slot with ${near.join(" and ")}`);
  if(T<9998&&T>=720&&T<1200&&!fixes.some(f=>f[0].startsWith("move")))fixes.push(["move:"+(T+120),"Move to "+fmtMin(T+120)]);
  if(T>=9998&&!fixes.length)why.push(`it has no set time, so it keeps getting pushed to "later"`),fixes.push(["move:"+(e.g==="Evening"?1080:e.g==="Afternoon"?900:600),"Give it a time ("+fmtMin(e.g==="Evening"?1080:e.g==="Afternoon"?900:600)+")"]);
  if(T<9998)fixes.push(["remind","Remind me 10 min before"]);
  if(e.miss>=Math.max(4,C.days.length*.5))fixes.push(["optional","Make it optional"]);
  out.push({key:e.id,ic:"⚠️",title:e.t+(e.time?" · "+e.time:""),sub:`Missed ${e.miss} of the last ${C.days.length} days${e.only?` · ${e.only} time${e.only>1?"s":""} it was your only miss`:""}`,
   why:why.length?why.join(", and ")+".":"you skip it more than anything else on your list.",fix:fixes.length?"Change when or how it happens so it fits your real day.":"",fixes,id:e.id})}
 const b=C.bucket,tot=C.total,worst=Object.entries(b).sort((x,y)=>y[1]-x[1])[0];
 if(tot>=4&&worst[1]/tot>=.5)out.push({key:"bucket:"+worst[0],ic:"🕘",title:`${worst[0][0].toUpperCase()+worst[0].slice(1)}s are your weak spot`,sub:`${Math.round(worst[1]/tot*100)}% of your misses happen ${worst[0]==="anytime"?"on tasks without a set time":"in the "+worst[0]}`,
  why:worst[0]==="evening"?"By the evening you've used up most of your energy, and late tasks pile up.":worst[0]==="morning"?"Mornings get rushed when you wake up late.":worst[0]==="anytime"?"Tasks without a time slide until the day is over.":"The afternoon is where meetings, food and trading crowd together.",
  fix:worst[0]==="evening"?"Move one or two evening tasks earlier, or stack them into one short night routine.":worst[0]==="anytime"?"Give your Anytime tasks a real time slot.":"Spread these tasks out or move one to a quieter time.",fixes:[["today","Show me my day"]]});
 if(C.working.length)out.push({key:"good",good:true,ic:"✅",title:"What's working",sub:"Not missed in the last 14 days",why:C.working.join(" · ")+". Build the rest of your day around these.",fixes:[]});
 return{C,out}}
function applyFix(id,kind){const r=S.routine.find(x=>x.id===id),done=m=>{RW().fixes[id+":"+kind]=1;save();renderToday();renderWeek();drawRoom();toast(m)};
 if(kind==="today"){closeRoom(true);go("today");return}
 if(!r){toast("That's a one-day task, so there's nothing to change in your routine");return}
 if(kind.startsWith("move:")){const m=+kind.split(":")[1];r.time=fmtMin(m);if(m>=1020)r.g="Evening";else if(m>=720)r.g="Afternoon";else r.g="Morning";done(`${r.t} moved to ${r.time}`)}
 else if(kind==="anytime"){r.time="";done(`${r.t} is now Anytime`)}
 else if(kind==="weekend"){r.optionalDow=[0,6];done(`${r.t} is optional on weekends`)}
 else if(kind==="optional"){r.optional=true;done(`${r.t} is now optional`)}
 else if(kind==="remind"){r.pre=10;done(`You'll get a reminder 10 min before ${r.t}`)}}
// ---- page ----
function dayProgress(k){const t=tasksFor(k).filter(x=>!x.optional),dd=S.days[k];const done=dd?t.filter(x=>dd.done[x.id]).length:0;return{done,total:t.length,complete:!!(dd&&dd.complete)||(t.length>0&&done===t.length)}}
function openStreak(from,tab){const el=$("troom");if(!el)return;roomGen++;el.getAnimations().forEach(a=>a.cancel());
 const src=from&&from.getBoundingClientRect?from:$("streakbtn");RO={kind:"streak",tab:tab||"streak",sel:null,cat:"All",origin:()=>{const r=src&&src.isConnected&&src.getBoundingClientRect();return r&&r.width&&r.bottom>0&&r.top<innerHeight?r:null}};
 el.style.setProperty("--acc","#FF9A4D");el.style.setProperty("--tbg","#0B0504");el.classList.remove("water");
 const d=Math.min(2,devicePixelRatio||1);paintScene($("trcv"),1,Math.round(Math.min(1800,innerWidth*d)),Math.round(340*d),41);drawRoom();roomShow(RO.origin())}
function drawStreakRoom(){const R=$("troom"),r=RW(),s=streak(),best=Math.max(S.best||0,s),k=dkey(),tier=tierOf(s),nextT=[...TIERS].reverse().find(t=>t[1]>s),tab=RO.tab||"streak";
 const todayEarn=r.ledger.filter(x=>sameDay(x.ts)).reduce((a,x)=>a+x.amt,0);
 let body="";
 if(tab==="streak"){const tp=dayProgress(k),nm=MILES.find(m=>m[0]>s),prevM=[...MILES].reverse().find(m=>m[0]<=s),I=coachInsights(),topI=I.out.find(x=>!x.good);
  const td=new Date();td.setHours(0,0,0,0);const end=new Date(td);end.setDate(end.getDate()+(6-((end.getDay()+6)%7)));const st=new Date(end);st.setDate(st.getDate()-34);
  const cells=[...Array(35)].map((_,i)=>{const x=new Date(st);x.setDate(st.getDate()+i);const kk=dkey(x),fut=x>td,pre=kk<startDay(),p=fut||pre?null:dayProgress(kk);return{x,kk,fut,pre,p}}),sel=RO.sel&&cells.find(c=>c.kk===RO.sel);
  const left=tasksFor(k).filter(x=>!x.optional&&!(S.days[k]&&S.days[k].done[x.id])).slice(0,4);
  body=`${topI&&I.C.by1?`<button class="stnudge" id="st-coach"><span>🧭</span><span><b>You missed ${I.C.by1} day${I.C.by1>1?"s":""} by just 1 task</b><small>Most often "${esc(topI.title.split(" · ")[0])}". See why and how to fix it →</small></span></button>`:topI?`<button class="stnudge" id="st-coach"><span>🧭</span><span><b>Coach has ${I.out.filter(x=>!x.good).length} tip${I.out.filter(x=>!x.good).length>1?"s":""} for you</b><small>Starting with "${esc(topI.title.split(" · ")[0])}" →</small></span></button>`:""}
   <div class="sttoday ${tp.complete?"done":""}"><div class="stth"><b>${tp.complete?"Today is cleared ✓":tp.total?`${tp.total-tp.done} left to keep the streak`:"No tasks today"}</b><span>${tp.done} of ${tp.total}${tp.complete?"":" · +50 🪙 when cleared"}</span></div><div class="stbar"><i style="width:${tp.total?Math.round(tp.done/tp.total*100):0}%"></i></div>
    ${!tp.complete&&left.length?`<div class="stleft">${left.map(t=>`<span>${esc(t.t)}</span>`).join("")}${tp.total-tp.done>left.length?`<span>+${tp.total-tp.done-left.length} more</span>`:""}</div><button class="stgo" id="st-today">Go to Today →</button>`:""}</div>
   <div class="sth4"><span>Milestones</span><span>${nm?`${nm[0]-s} day${nm[0]-s===1?"":"s"} to ${nm[0]} · +${nm[1]} 🪙`:"All unlocked"}</span></div>
   <div class="stmiles">${MILES.map(([m,bn])=>{const got=best>=m,cur=nm&&m===nm[0];return`<div class="stm ${got?"got":""} ${cur?"next":""}"><b>${m}</b><small>+${bn}</small>${cur?`<i style="width:${Math.round((s-(prevM?prevM[0]:0))/(m-(prevM?prevM[0]:0))*100)}%"></i>`:""}</div>`}).join("")}</div>
   <div class="sth4"><span>Last 5 weeks</span><span>${cells.filter(c=>c.p&&c.p.complete).length} cleared</span></div>
   <div class="stcal">${["M","T","W","T","F","S","S"].map(d=>`<span class="h">${d}</span>`).join("")}${cells.map(c=>{const pct=c.p&&c.p.total?c.p.done/c.p.total:0,cls=c.fut?"fut":c.pre?"pre":c.p.complete?"ok":pct>0?"part":"miss";
    return`<button class="${cls} ${c.kk===k?"today":""} ${RO.sel===c.kk?"sel":""}" data-k="${c.kk}" ${c.fut||c.pre?"disabled":""} style="--p:${Math.round(pct*100)}%" aria-label="${c.x.toLocaleDateString([], {month:"short",day:"numeric"})}${c.p?": "+(c.p.complete?"cleared":c.p.done+" of "+c.p.total):""}">${c.p&&c.p.complete?"🔥":c.x.getDate()}</button>`}).join("")}</div>
   <div class="stlegend"><span><i class="ok"></i>Cleared</span><span><i class="part"></i>Partly</span><span><i class="miss"></i>Missed</span></div>
   ${sel&&sel.p?`<div class="stsel"><b>${sel.x.toLocaleDateString([], {weekday:"long",month:"long",day:"numeric"})}</b><span>${sel.p.complete?"Cleared":`${sel.p.done} of ${sel.p.total} done`}</span></div>`:""}
   <div class="sth4"><span>How you earn</span><span>today ${todayEarn>=0?"+":""}${todayEarn} 🪙</span></div>
   <div class="stearn">${[["✓","Each task done","+10"],["🔥","Clear the whole day","+50"],["💧","Hit your water goal","+20"],["🍗","Eat all your planned meals","+20"],["🌬️","Beat a smoke urge","+15"],["📈","Log a trade, meal or journal entry","+5"],["🏆","Streak milestones","+100 to +5,000"]].map(x=>`<div><i>${x[0]}</i><span>${x[1]}</span><b>${x[2]}</b></div>`).join("")}</div>`}
 if(tab==="coach"){const {C,out}=coachInsights();
  body=C.days.length<3?`<div class="stempty"><b>The coach needs a few days</b>After 3 days of history it will show what keeps breaking your streak and how to fix it.</div>`
  :`<div class="cosum"><div><b>Last ${C.days.length} days</b><small>${C.cleared} cleared · ${C.missed} missed</small></div><div class="trring sm"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="3.5"/><circle cx="18" cy="18" r="15" fill="none" stroke="var(--acc)" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="${(C.cleared/C.days.length*94.25).toFixed(1)} 94.25" transform="rotate(-90 18 18)"/></svg><b>${Math.round(C.cleared/C.days.length*100)}%</b></div></div>
   <div class="comiss"><div><b>${C.by1}</b><small>missed by 1 task</small></div><div><b>${C.by23}</b><small>by 2–3</small></div><div><b>${C.by4}</b><small>by 4+</small></div></div>
   <div class="sth4"><span>What keeps breaking it</span><span>most missed first</span></div>
   ${out.length?out.map(x=>`<div class="coin ${x.good?"good":""}"><div class="coh"><span>${x.ic}</span><div><b>${esc(x.title)}</b><small>${esc(x.sub)}</small></div></div>
    ${x.id&&Object.keys(RW().fixes).some(f=>f.startsWith(x.id+":"))?`<p class="cochg">✓ You adjusted this already. Give it a few days to see if it helps.</p>`:""}
    <p>${x.good?"":"<b>Why:</b> "}${esc(x.why)}</p>${x.fix?`<p><b>Try:</b> ${esc(x.fix)}</p>`:""}
    ${x.fixes.length?`<div class="coacts">${x.fixes.map((f,i)=>{const done=RW().fixes[(x.id||x.key)+":"+f[0]];return`<button class="coact ${i===0&&!done?"p":""} ${done?"done":""}" data-id="${esc(x.id||"")}" data-fix="${esc(f[0])}" ${done?"disabled":""}>${done?"✓ ":""}${esc(f[1])}</button>`}).join("")}</div>`:""}</div>`).join("")
   :`<div class="stempty"><b>Nothing keeps breaking it</b>No task has been missed more than once lately. Keep going.</div>`}`}
 if(tab==="store"){const items=storeItems(),cats=["All","Do","Treat","Buy"],cat=RO.cat||"All";
  body=`<div class="tier2"><span>${tier[2]}</span><div><b>${tier[0]} tier</b><small>${nextT?`${nextT[1]-s} more streak day${nextT[1]-s===1?"":"s"} to ${nextT[0]}, which unlocks ${nextT[0]} rewards`:"Top tier. Everything is unlocked."}</small></div></div>
   <div class="fochips">${cats.map(c=>`<button data-cat="${c}" class="${c===cat?"on":""}">${c}</button>`).join("")}</div>
   <div class="stgrid">${items.filter(x=>cat==="All"||x.c===cat).map(x=>{const tl=TIER_DAYS[x.t]>s,short=x.p>r.coins;return`<div class="sti ${tl||short?"locked":""}">${tl?`<span class="stlock">🔒 ${x.t}</span>`:""}<span class="ic">${x.ic}</span><b>${esc(x.n)}</b><small>${esc(x.d)}</small>${!tl&&short?`<div class="stprog"><i style="width:${Math.round(r.coins/x.p*100)}%"></i></div>`:""}
    <div class="stprice"><span>🪙 ${x.p.toLocaleString()}</span><button class="stbuy" data-id="${esc(x.id)}">${tl?"Locked":short?`${(x.p-r.coins).toLocaleString()} more`:"Buy"}</button></div>${x.custom?`<button class="stdel" data-del="${esc(x.id)}" aria-label="Remove reward">×</button>`:""}</div>`}).join("")}
   <button class="sti add" id="st-add">+ Add your own reward</button></div>
   <p class="trmin">Things to buy are priced at ${COINS_PER_DOLLAR} 🪙 per dollar. Buying here is the reward; you still buy it for real in Money when you do.</p>`}
 if(tab==="hist"){const L=[...r.ledger].reverse().slice(0,150);body=L.length?`<div class="sthist">${L.map(x=>`<div><span>${esc(x.label)}<small>${whenStr(x.ts)}</small></span><b class="${x.amt>0?"p":"m"}">${x.amt>0?"+":"−"}${Math.abs(x.amt).toLocaleString()} 🪙</b></div>`).join("")}</div>`:`<div class="stempty"><b>No coins yet</b>Finish a task and your first coins land here.</div>`}
 $("trs").innerHTML=`<div class="trbar"><button class="trib" id="tr-back" aria-label="Back"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg></button><span class="treb">Streak · Rewards</span><span class="stwallet" aria-label="${r.coins} coins">🪙 ${r.coins.toLocaleString()}</span></div>
 <div class="trin"><div class="sthero"><div class="stflame ${s?"lit":""}" aria-hidden="true">🔥</div><div><div class="stnum">${s}<span>${s===1?"day":"days"}</span></div><div class="trsub">${s?`Best ever: ${best} day${best===1?"":"s"} · Level ${level()} · ${tier[2]} ${tier[0]}`:best?`Your best is ${best} day${best===1?"":"s"}. Start a new run today.`:"Clear today's list to start your first streak."}</div></div></div>
 <div class="fotabs" role="tablist">${[["streak","Streak"],["coach","Coach"],["store","Store"],["hist","History"]].map(([t,n])=>`<button role="tab" data-st="${t}" class="${t===tab?"on":""}" aria-selected="${t===tab}">${n}</button>`).join("")}</div>
 <div class="fobody">${body}</div></div>`;
 $("trfoot").innerHTML="";const q=x=>R.querySelector(x);q("#tr-back").onclick=()=>closeRoom();
 R.querySelectorAll("[data-st]").forEach(b=>b.onclick=()=>{RO.tab=b.dataset.st;drawRoom()});
 const co=q("#st-coach");if(co)co.onclick=()=>{RO.tab="coach";drawRoom()};const g=q("#st-today");if(g)g.onclick=()=>{closeRoom(true);go("today")};
 R.querySelectorAll(".stcal button[data-k]").forEach(b=>b.onclick=()=>{RO.sel=RO.sel===b.dataset.k?null:b.dataset.k;drawRoom()});
 R.querySelectorAll(".coact").forEach(b=>b.onclick=()=>applyFix(b.dataset.id,b.dataset.fix));
 R.querySelectorAll("[data-cat]").forEach(b=>b.onclick=()=>{RO.cat=b.dataset.cat;drawRoom()});
 R.querySelectorAll(".stbuy").forEach(b=>b.onclick=()=>{const x=storeItems().find(i=>i.id===b.dataset.id);if(!x)return;if(TIER_DAYS[x.t]>s){toast(`Reach ${x.t} (a ${TIER_DAYS[x.t]}-day streak) to unlock this`);return}if(x.p>r.coins){toast(`${(x.p-r.coins).toLocaleString()} more 🪙 needed`);return}
  r.coins-=x.p;r.ledger.push({ts:Date.now(),amt:-x.p,label:"Bought: "+x.n});save();burst(b,["#F3C64F","#FF9A4D","#FFE7A3"]);toast("Enjoy it: "+x.n);drawRoom()});
 R.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{r.items=r.items.filter(i=>i.id!==b.dataset.del);save();drawRoom()});
 const ad=q("#st-add");if(ad)ad.onclick=()=>openSheet(`<h2>Add a reward</h2><p class="desc">Something you'd enjoy that you want to earn.</p>
  <div class="field"><label for="rw-n">Reward</label><input id="rw-n" placeholder="New video game, night out…" autocomplete="off"></div>
  <div class="pair"><div class="field"><label for="rw-p">Price (🪙)</label><input id="rw-p" type="number" inputmode="numeric" value="500"></div><div class="field"><label for="rw-i">Emoji</label><input id="rw-i" value="🎁" maxlength="4"></div></div>
  <div class="field"><label>Type</label>${opts("c",[["Do","Do"],["Treat","Treat"],["Buy","Buy"]],"Do")}</div><div class="field"><label>Unlocks at</label>${opts("t",[["Starter","Any streak"],["Bronze","Bronze (3)"],["Silver","Silver (7)"],["Gold","Gold (30)"]],"Bronze")}</div>
  <div class="btns"><button class="action p" id="rw-s">Add reward</button></div>`,root=>{bindOpts(root);root.querySelector("#rw-s").onclick=()=>{const n=root.querySelector("#rw-n").value.trim();if(!n){toast("Name the reward");return}
   r.items.push({id:"c"+uid(),c:optVal(root,"c"),ic:root.querySelector("#rw-i").value.trim()||"🎁",n,d:"Your reward",p:Math.max(10,Math.round(+root.querySelector("#rw-p").value||500)),t:optVal(root,"t")});save();closeSheet();RO.tab="store";drawRoom();toast("Reward added")}})}

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
// One dog at a time: an "all normal" shortcut, then picture tiles for anything that was different.
const DCI_NORMAL={food:100,water:"normal",stool:3,urine:"yellow",energy:4};
const DCI_STOOL=[["#4A2E1C","Hard"],["#7A4A26","Firm"],["#9A6332","Normal"],["#B98A55","Soft"],["#D2B48A","Watery"]];
const DCI_EN=["#EE8E86","#EFA98A","#EFBC90","#B8D7A0","#86D3B0"];
function dciBowl(p){const cp="dcib"+p;return`<svg viewBox="0 0 34 22" aria-hidden="true"><defs><clipPath id="${cp}"><path d="M2 8h30a15 13 0 0 1-30 0z"/></clipPath></defs><path d="M2 8h30a15 13 0 0 1-30 0z" fill="#2E1F16" stroke="#7A5E4A" stroke-width="1.2"/>${p?`<rect x="0" y="${8+14*(1-p/100)}" width="34" height="14" fill="#C9874F" clip-path="url(#${cp})"/>`:""}</svg>`}
function dogCheckIn(){const k=dkey(),D=S.dogs;
 const ans={};D.list.forEach(d=>{const l=dogLog(k,d.id)||{};ans[d.id]={...l};if(ans[d.id].note==="")delete ans[d.id].note});
 const keys=["food","water","stool","urine","energy"],full=a=>keys.every(x=>a[x]!==undefined&&a[x]!==""),isNorm=a=>keys.every(x=>a[x]===DCI_NORMAL[x]);
 let cur=(D.list.find(d=>!full(ans[d.id]))||D.list[0]||{}).id,noteOpen={};
 const flagsOf=a=>{const w=[];if(a.food===0)w.push("Ate nothing");if(a.stool===5)w.push("Watery stool");if(a.energy===1)w.push("Very low energy");if(a.urine==="dark")w.push("Dark urine");if(a.water==="low")w.push("Drinking less");return w};
 const body=()=>{const d=D.list.find(x=>x.id===cur);if(!d)return`<p class="desc">Add your dogs in Names and weights first.</p>`;const a=ans[cur],nm=esc(d.name),tile=(key,v,inner,lab)=>`<button class="dci-tile ${a[key]===v?"on":""}" data-k="${key}" data-v="${v}" aria-pressed="${a[key]===v}">${inner}<small>${lab}</small></button>`;
  return`<div class="dci-dogs">${D.list.map((x,i)=>{const b=ans[x.id];return`<button class="dci-dog ${x.id===cur?"on":""}" data-dog="${x.id}"><span class="dci-av" aria-hidden="true">${i%2?"🐕":"🐺"}</span><span><b>${esc(x.name)}</b><small class="${full(b)?"ok":""}">${full(b)?"✓ Done":Object.keys(b).some(y=>keys.includes(y))?"In progress":"Not yet"}</small></span></button>`}).join("")}</div>
  <button class="dci-ok ${full(a)&&isNorm(a)?"done":""}" id="dci-ok"><span><b>${nm} was normal today</b><small>Ate it all · normal water · firm stool · good energy</small></span><em aria-hidden="true">${full(a)&&isNorm(a)?"✓":"👍"}</em></button>
  <div class="dci-lab">Food eaten <b>${a.food!==undefined?a.food+"%":""}</b></div><div class="dci-t c5">${[0,25,50,75,100].map(p=>tile("food",p,dciBowl(p),p+"%")).join("")}</div>
  <div class="dci-lab">Water</div><div class="dci-t c3">${[["low","💧","Less"],["normal","💧💧","Normal"],["high","💧💧💧","More"]].map(([v,i,l])=>tile("water",v,`<i aria-hidden="true">${i}</i>`,l)).join("")}</div>
  <div class="dci-lab">Stool</div><div class="dci-t c5">${DCI_STOOL.map(([c,l],i)=>tile("stool",i+1,`<i class="dci-dot" style="background:${c}"></i>`,l)).join("")}</div><div class="dci-zone"><span>healthy</span></div>
  <div class="dci-lab">Urine</div><div class="dci-t c2">${[["yellow","#F2D46B","Pale yellow"],["dark","#C9822E","Dark"]].map(([v,c,l])=>tile("urine",v,`<i class="dci-sw" style="background:${c}"></i>`,l)).join("")}</div>
  <div class="dci-lab">Energy</div><div class="dci-batt">${[1,2,3,4,5].map(n=>`<button data-k="energy" data-v="${n}" class="${a.energy>=n?"f":""}" style="${a.energy>=n?"background:"+DCI_EN[a.energy-1]:""}" aria-pressed="${a.energy===n}" aria-label="Energy ${n} of 5">${n}</button>`).join("")}</div><div class="dci-bl"><span>Very low</span><span>Full energy</span></div>
  ${noteOpen[cur]||a.note?`<input class="dci-note" id="dci-note" value="${esc(a.note||"")}" placeholder="Anything unusual about ${nm}?">`:`<button class="dci-addn" id="dci-addn">+ Add a note</button>`}
  ${flagsOf(a).length?`<div class="dci-flags">${flagsOf(a).map(f=>`<span>⚠ ${esc(f)}</span>`).join("")}</div>`:""}`};
 const nextDog=()=>D.list.find(x=>x.id!==cur&&!full(ans[x.id]));
 openSheet(`<h2>Tonight's check-in</h2><p class="desc">${new Date().toLocaleDateString([], {weekday:"long",month:"long",day:"numeric"})} · about 10 seconds</p><div id="dci-body">${body()}</div>
 <div class="btns"><button class="action p" id="dc-save">Save check-in</button></div>`,
 root=>{const box=root.querySelector("#dci-body"),saveBtn=root.querySelector("#dc-save");
  const keepNote=()=>{const n=root.querySelector("#dci-note");if(n)ans[cur].note=n.value};
  const paint=()=>{box.innerHTML=body();const nx=nextDog();saveBtn.textContent=full(ans[cur])&&nx?`Next: ${nx.name} →`:"Save check-in";bind()};
  const bind=()=>{box.querySelectorAll("[data-dog]").forEach(b=>b.onclick=()=>{keepNote();cur=b.dataset.dog;paint()});
   const ok=box.querySelector("#dci-ok");if(ok)ok.onclick=()=>{keepNote();Object.assign(ans[cur],DCI_NORMAL);try{navigator.vibrate&&navigator.vibrate(10)}catch(e){}paint();const nx=nextDog();if(nx)setTimeout(()=>{if(!root.isConnected||$("sheetwrap").hidden)return;cur=nx.id;paint();root.scrollTo({top:0,behavior:RM?"auto":"smooth"})},420)};
   box.querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>{keepNote();const v=b.dataset.v;ans[cur][b.dataset.k]=isNaN(+v)?v:+v;paint()});
   const an=box.querySelector("#dci-addn");if(an)an.onclick=()=>{noteOpen[cur]=1;paint();const n=box.querySelector("#dci-note");if(n)n.focus()}};
  paint();
  saveBtn.onclick=()=>{keepNote();const nx=nextDog();if(full(ans[cur])&&nx){cur=nx.id;paint();root.scrollTo({top:0,behavior:RM?"auto":"smooth"});return}
   S.dogs.log[k]=S.dogs.log[k]||{};let any=false;
   for(const d of D.list){const a=ans[d.id],e={food:a.food,water:a.water,stool:a.stool,urine:a.urine,energy:a.energy,note:(a.note||"").trim()};
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
function addWater(ml,el){if(!(ml>0))return;const k=dkey();waterAt=Date.now();if(Math.random()<.3)setTimeout(()=>waterNote(true),900);(W().log[k]=W().log[k]||[]).push({ts:Date.now(),ml:Math.round(ml)});afterWater(true,el);
 toast(`+${ml} ml · ${fmtL(waterToday())} of ${fmtL(W().goal)}`,"Undo",()=>{const l=W().log[k];if(l&&l.length){l.pop();afterWater(false)}})}
function afterWater(added,el){const k=dkey(),t=waterTask(),dd=dayData(k),hit=waterToday(k)>=W().goal;
 if(hit&&added)earnOnce(20,"Water goal","water:"+k);
 if(t){if(hit&&!dd.done[t.id]){toggleTask(t.id,el);if(added)setTimeout(()=>{toast("Water goal reached. "+fmtL(W().goal)+" today.");burst(el||$("wbig"),["#7AB8F0","#A9D5F5","#EFBC90"])},250)}else if(!hit&&dd.done[t.id])toggleTask(t.id)}
 save();renderWater();if(RO&&RO.kind==="water"){drawRoom();if(added&&hit&&waterToday(k)-((W().log[k]||[]).slice(-1)[0]||{ml:0}).ml<W().goal)roomFlash("💧","Goal reached",fmtL(W().goal)+" today · nice work")}}
function renderWater(){const p=waterPace(),g=W().goal,pct=Math.min(100,Math.round(p.drunk/g*100));
 const lbl=$("waterlbl");if(lbl)lbl.textContent=fmtL(p.drunk)+" / "+fmtL(g);const dot=$("waterdot");if(dot)dot.hidden=!(p.behind>=500&&p.drunk<g);
 const c=$("watercard");if(!c)return;
 // Water as glasses: one glass per preset amount (8 × 500 ml for 4 L). Tap an empty glass to log one, a full one for details.
 const n=Math.max(1,Math.min(12,Math.round(g/W().step))),per=g/n,full=p.drunk/per,exp=p.expected/per,justI=Date.now()-waterAt<900?Math.ceil(full)-1:-1;
 c.innerHTML=`<div class="gl">${[...Array(n)].map((_,i)=>{const f=Math.max(0,Math.min(1,full-i));return`<button class="gls ${f>=1?"f":""} ${i===justI?"just":""} ${full<exp&&i===Math.ceil(exp)-1?"pace":""}" data-i="${i}" aria-label="${f>=1?"Full glass, open water log":"Log "+W().step+" ml"}"><i style="height:${Math.round(f*82)}%"></i></button>`}).join("")}</div>
 <div class="glinfo"><span id="wbig"><b>${fmtL(p.drunk)}</b> of ${fmtL(g)}</span><span class="${p.behind>=500&&p.drunk<g?"behind":""}">${p.drunk>=g?"Goal reached. Nice work.":p.behind>=500?`${fmtL(p.behind)} behind pace`:`On pace · ${fmtL(Math.max(0,g-p.drunk))} to go`}</span><button class="link" id="wdetail">Log or remind</button></div>`;
 c.onclick=()=>openWater(c);c.setAttribute("role","button");c.setAttribute("aria-label","Open water log");c.tabIndex=0;c.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openWater(c)}}}
var waterAt=0;
// Hydration tips on a sticky note that pops up now and then on the Today page. Tap it for another, × to close.
const WATER_TIPS=["Squeeze in some lemon or lime. A little flavor makes it easier to keep sipping.","Add a tiny pinch of salt after a workout or a sweaty day. It helps your body hold on to the water.","Drink a full glass right when you wake up. You've gone all night without any.","Keep a bottle where you can see it. Out of sight really is out of mind.","Cold water goes down easier. Throw some ice in.","Drop in cucumber, mint or a few berries for flavor without the sugar.","Have a glass before every meal. Easy 1.5 L right there.","Sip during training. Roughly 500 ml for every hour you work out.","Pale yellow means you're doing well. Dark yellow means drink up.","Feeling snacky? You might just be thirsty. Try a glass first.","Coffee counts a little, but match each cup with a glass of water.","Hot day or heavy sweat? Add electrolytes, not just water.","Use a straw. Most people drink more without noticing.","Tie it to a habit: a glass after every trade review or every bathroom break.","Eat your water too: watermelon, oranges and cucumber are mostly water.","Front-load it. Aim for half your goal by early afternoon so you're not chugging at night.","Big gulps feel like a chore. Small, steady sips add up faster than you think.","A warm mug of water with lemon counts. Not everything has to be ice cold."];
let wnoteAt=0,wnoteLast=-1,wnoteT=0;
function waterNote(force){const n=$("wnote");if(!n||!$("p-today").classList.contains("on"))return;
 if(!force&&(Date.now()-wnoteAt<12*60e3||Math.random()>.6))return;wnoteAt=Date.now();
 let i;do i=Math.floor(Math.random()*WATER_TIPS.length);while(i===wnoteLast&&WATER_TIPS.length>1);wnoteLast=i;
 n.style.setProperty("--r",(Math.random()*5-3).toFixed(1)+"deg");
 n.innerHTML=`<b>💧 Hydration tip</b><p>${esc(WATER_TIPS[i])}</p><button class="wnx" aria-label="Close tip">×</button>`;
 n.hidden=false;n.classList.remove("pop","out");void n.offsetWidth;n.classList.add("pop");
 n.onclick=e=>{if(e.target.closest(".wnx"))return hideNote();waterNote(true)};
 clearTimeout(wnoteT);wnoteT=setTimeout(hideNote,25000)}
const FOOD_TIPS_HUNGRY=["Grab a snack: Greek yogurt, a banana or a handful of nuts. Something beats nothing.","No time to cook? Have a shake now and eat properly later.","Hungry and busy? Eat one of your meal-prep containers cold. It still counts.","A slice of toast with peanut butter takes two minutes and buys you hours.","Eat first, then decide. Skipping meals makes the next one harder.","Low appetite? Start small: a few bites now, the rest in 30 minutes."];
const FOOD_TIPS=["Protein with every meal. It's the easiest way to hit 160 g.","Eat breakfast within an hour of waking. It sets the pace for the day.","Keep snacks where you'll see them: nuts, fruit, yogurt.","Bulking? Liquid calories are easier: whole milk, shakes and smoothies.","Plan tomorrow's first meal tonight so the morning is automatic.","Eat slowly. It's easier on your stomach and you'll notice when you're full.","Add olive oil, avocado or nuts to meals for easy extra calories.","Train hungry? Have a small carb snack 30 to 60 minutes before."];
let fnoteAt=0,fnoteLast=-1,fnoteT=0;
function foodNote(force){const n=$("fnote");if(!n||!$("p-today").classList.contains("on"))return;
 if(!force&&(Date.now()-fnoteAt<15*60e3||Math.random()>.5))return;fnoteAt=Date.now();const list=isHungry()?FOOD_TIPS_HUNGRY:FOOD_TIPS;
 let i;do i=Math.floor(Math.random()*list.length);while(i===fnoteLast&&list.length>1);fnoteLast=i;
 n.style.setProperty("--r",(Math.random()*5-2).toFixed(1)+"deg");
 n.innerHTML=`<b>🍗 ${isHungry()?"Time to eat":"Food tip"}</b><p>${esc(list[i])}</p><button class="wnx" aria-label="Close tip">×</button>`;
 n.hidden=false;n.classList.remove("pop","out");void n.offsetWidth;n.classList.add("pop");
 n.onclick=e=>{if(e.target.closest(".wnx"))return hideFNote();hideFNote();openFood("me")};
 clearTimeout(fnoteT);fnoteT=setTimeout(hideFNote,25000)}
function hideFNote(){const n=$("fnote");if(!n||n.hidden)return;clearTimeout(fnoteT);n.classList.add("out");setTimeout(()=>{n.hidden=true;n.classList.remove("out")},260)}
function hideNote(){const n=$("wnote");if(!n||n.hidden)return;clearTimeout(wnoteT);n.classList.add("out");setTimeout(()=>{n.hidden=true;n.classList.remove("out")},260)}
/* ===== Water room: the water chip / glasses grow into a full-screen page whose top is a tank that fills
   as you drink (waves, bubbles, a peach pace mark). Quick add, today's drinks, a 7-day chart and the reminder
   settings folded at the bottom. Same data and actions as the old water sheet. ===== */
function openWater(from){const el=$("troom");if(!el)return;roomGen++;el.getAnimations().forEach(a=>a.cancel());
 const src=from&&from.getBoundingClientRect?from:null;RO={kind:"water",rem:false,origin:()=>{const r=src&&src.isConnected&&src.getBoundingClientRect();return r&&r.width&&r.bottom>0&&r.top<innerHeight?r:null}};
 el.style.setProperty("--acc","#7AB8F0");el.style.setProperty("--tbg","#04101A");el.classList.add("water");
 const r=RO.origin();drawRoom();roomShow(r);waterTank()}
let WT=null;
function waterTank(){const cv=$("trcv"),H=340,st={lvl:null,amp:5,bub:[...Array(22)].map(()=>({x:Math.random(),y:1+Math.random(),r:1+Math.random()*2.6,s:.0018+Math.random()*.004})),stars:[...Array(55)].map(()=>[Math.random(),Math.random()*.42,Math.random()*.9+.3,Math.random()*.5+.25])};WT=st;
 const frame=t=>{if(WT!==st||!RO||RO.kind!=="water"||!$("troom").classList.contains("on"))return;
  const d=Math.min(2,devicePixelRatio||1),cw=cv.clientWidth||innerWidth;if(cv.width!==Math.round(cw*d)||cv.height!==Math.round(H*d)){cv.width=Math.round(cw*d);cv.height=Math.round(H*d)}
  const c=cv.getContext("2d");c.setTransform(d,0,0,d,0,0);const p=waterPace(),g=W().goal,ts=t/1000;
  let gr=c.createLinearGradient(0,0,0,H);gr.addColorStop(0,"#030A12");gr.addColorStop(1,"#0A2236");c.fillStyle=gr;c.fillRect(0,0,cw,H);
  st.stars.forEach(s=>{c.fillStyle=`rgba(255,255,255,${s[3]})`;c.beginPath();c.arc(s[0]*cw,s[1]*H,s[2],0,7);c.fill()});
  const target=H-58-(H-140)*Math.min(1,p.drunk/g);st.lvl=(RM||document.hidden)?target:st.lvl===null?H:st.lvl+(target-st.lvl)*.05;st.amp+=((RM?0:4)-st.amp)*.03;
  const wave=(x,ph,a,f)=>st.lvl+Math.sin(x/cw*Math.PI*2*f+ts*1.3+ph)*a+Math.sin(x/cw*Math.PI*2*f*2.3-ts*1.9+ph)*a*.35;
  c.beginPath();c.moveTo(0,H);for(let x=0;x<=cw+6;x+=6)c.lineTo(x,wave(x,2,st.amp*.8,1.2)-6);c.lineTo(cw,H);c.fillStyle="rgba(90,160,225,.28)";c.fill();
  c.beginPath();c.moveTo(0,H);for(let x=0;x<=cw+6;x+=6)c.lineTo(x,wave(x,0,st.amp,1.5));c.lineTo(cw,H);gr=c.createLinearGradient(0,st.lvl-10,0,H);gr.addColorStop(0,"rgba(122,184,240,.9)");gr.addColorStop(.4,"#2D6FAE");gr.addColorStop(1,"#0B2B4A");c.fillStyle=gr;c.fill();
  c.strokeStyle="rgba(220,240,255,.55)";c.lineWidth=1.5;c.beginPath();for(let x=0;x<=cw+6;x+=6){const y=wave(x,0,st.amp,1.5);x?c.lineTo(x,y):c.moveTo(x,y)}c.stroke();
  if(!RM)st.bub.forEach(b=>{b.y-=b.s;const y=b.y*H;if(y<st.lvl+8){b.y=1+Math.random()*.3;b.x=Math.random()}c.strokeStyle="rgba(220,240,255,.45)";c.lineWidth=1;c.beginPath();c.arc(b.x*cw,Math.max(y,st.lvl+8),b.r,0,7);c.stroke()});
  if(p.drunk<g){const py=H-58-(H-140)*Math.min(1,p.expected/g);c.setLineDash([5,5]);c.strokeStyle="rgba(239,188,144,.85)";c.lineWidth=1.5;c.beginPath();c.moveTo(cw-96,py);c.lineTo(cw-14,py);c.stroke();c.setLineDash([]);
   c.fillStyle="#EFBC90";c.font="600 10px 'Work Sans',sans-serif";c.textAlign="right";c.fillText("PACE",cw-14,py-6)}
  if(!RM&&!document.hidden)requestAnimationFrame(frame)};
 requestAnimationFrame(frame)}
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&RO&&RO.kind==="water")waterTank()});
function drawWaterRoom(){const k=dkey(),p=waterPace(),g=W().goal,log=waterLog(k),frac=Math.min(1,p.drunk/g),R=$("troom");
 const days=[...Array(7)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);return[d.toLocaleDateString([], {weekday:"narrow"}),waterToday(dkey(d)),i===6]});
 const top=Math.max(g*1.15,...days.map(x=>x[1])),past=days.slice(0,6).filter(x=>x[1]>0),avg=past.length?past.reduce((t,x)=>t+x[1],0)/past.length:0;
 const every=+W().every===120?"2 hours":W().every+" min",nRem=Math.max(1,Math.floor((tmin(W().end)-tmin(W().start))/W().every)+1),notifOK=typeof Notification!=="undefined";
 $("trs").innerHTML=`<div class="trbar"><button class="trib" id="tr-back" aria-label="Back"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg></button><span class="treb">Water · goal ${esc(fmtL(g))}</span><button class="trib" id="wr-gear" aria-label="Reminder settings"><svg viewBox="0 0 24 24"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg></button></div>
 <div class="trin">
  <div class="trhero wrhero"><div><div class="wrbig">${fmtL(p.drunk).replace(" L","")}<span>L</span></div><div class="trsub">${p.drunk>=g?"Goal reached today":`of ${esc(fmtL(g))} · ${p.behind>=250?`<b class="wrbehind">${fmtL(p.behind)} behind pace</b>`:"on pace"}`}</div></div><div class="wrpct">${Math.round(frac*100)}%</div></div>
  <div class="wrq"><button class="wrqb main" id="ws-add">+${W().step} ml<small>a glass</small></button><button class="wrqb" id="ws-250">+250 ml<small>half</small></button><button class="wrqb" id="ws-cust">Custom<small>any amount</small></button></div>
  <div class="add wrcust" id="ws-custrow" hidden><input id="ws-ml" type="number" inputmode="numeric" placeholder="Amount in ml" aria-label="Custom amount in ml"><button class="action p" id="ws-log">Log</button></div>
  <div class="wrsec"><h4><span>Today</span><span>${log.length?log.length+(log.length===1?" drink":" drinks"):""}</span></h4>${log.length?`<div class="wrlog">${log.map((e,i)=>`<span class="wrl">💧 ${e.ml} ml <small>${timeStr(e.ts)}</small><button data-del="${i}" aria-label="Remove ${e.ml} ml">✕</button></span>`).join("")}</div>`:`<p class="trmin">Nothing yet today. Tap +${W().step} ml after each glass.</p>`}</div>
  <div class="wrsec"><h4><span>Last 7 days</span><span>${avg?"avg "+fmtL(Math.round(avg/50)*50):""}</span></h4>
   <div class="wrchart">${days.map(([,ml,t])=>`<div class="wrc ${ml>=g?"full":""} ${t?"today":""}"><em>${ml?(ml/1000).toFixed(1):""}</em><i style="height:${Math.max(2,ml/top*84).toFixed(1)}%"></i></div>`).join("")}<div class="wrgoal" style="bottom:${(g/top*84).toFixed(1)}%"><span>${esc(fmtL(g))} goal</span></div></div>
   <div class="wrlabels">${days.map(([l,,t])=>`<span class="${t?"t":""}">${l}</span>`).join("")}</div></div>
  <details class="wrrem" id="wr-rem" ${RO.rem?"open":""}><summary><span>Reminders<small>Every ${esc(every)} · ${esc(W().start)} to ${esc(W().end)} · about ${nRem} a day</small></span><b>›</b></summary>
   <div class="pair"><div class="field"><label for="ws-s">From</label><input id="ws-s" value="${esc(W().start)}"></div><div class="field"><label for="ws-e">Until</label><input id="ws-e" value="${esc(W().end)}"></div></div>
   <div class="field"><label>Every</label>${opts("every",[["60","60 min"],["90","90 min"],["120","2 hours"]],String(W().every))}</div>
   <div class="pair"><div class="field"><label for="ws-goal">Daily goal (L)</label><input id="ws-goal" type="number" step="0.25" inputmode="decimal" value="${g/1000}"></div><div class="field"><label for="ws-step">Quick button (ml)</label><input id="ws-step" type="number" step="50" inputmode="numeric" value="${W().step}"></div></div>
   <button class="action p" id="ws-save" style="width:100%;margin-top:14px">Save settings</button>
   <p class="trmin" style="margin-top:14px"><b style="color:var(--soft)">Phone reminders (recommended).</b> Adds repeating reminders to your phone's calendar. They go off even when Op-Lock In is closed.</p>
   <button class="action" id="ws-cal" style="width:100%;margin-top:8px">Add reminders to my calendar</button>
   ${notifOK?`<button class="action" id="ws-notif" style="width:100%;margin-top:8px">${W().notify&&Notification.permission==="granted"?"App notifications: on · turn off":"Turn on app notifications"}</button><p class="trmin">App notifications only arrive while Op-Lock In is running in the background. They include a Log ${W().step} ml button.</p>`:""}
  </details>
 </div>`;
 $("trfoot").innerHTML="";
 const q=s=>R.querySelector(s);bindOpts(R);
 q("#tr-back").onclick=()=>closeRoom();
 const rem=q("#wr-rem");rem.ontoggle=()=>{if(RO)RO.rem=rem.open};q("#wr-gear").onclick=()=>{rem.open=true;RO.rem=true;setTimeout(()=>rem.scrollIntoView({behavior:RM?"auto":"smooth",block:"start"}),50)};
 const splash=()=>{if(WT)WT.amp=18};
 q("#ws-add").onclick=e=>{splash();addWater(W().step,e.currentTarget)};q("#ws-250").onclick=e=>{splash();addWater(250,e.currentTarget)};
 q("#ws-cust").onclick=()=>{const row=q("#ws-custrow");row.hidden=!row.hidden;if(!row.hidden)q("#ws-ml").focus()};
 q("#ws-log").onclick=()=>{const v=+q("#ws-ml").value;if(!(v>0&&v<=3000)){toast("Enter an amount between 1 and 3000 ml");return}splash();addWater(v)};
 R.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{W().log[k].splice(+b.dataset.del,1);afterWater(false)});
 q("#ws-save").onclick=()=>{const s=q("#ws-s").value.trim(),e=q("#ws-e").value.trim();if(tmin(s)>=9998||tmin(e)>=9998||tmin(e)<=tmin(s)){toast("Use times like 7:00 AM and 9:00 PM");return}
  const goal=Math.round((+q("#ws-goal").value||4)*1000),step=Math.round(+q("#ws-step").value||500);Object.assign(W(),{start:s,end:e,every:+optVal(R,"every"),goal:Math.max(500,goal),step:Math.max(50,step)});
  const t=waterTask();if(t)t.t="Drink "+fmtL(W().goal)+" of water";save();renderToday();afterWater(false);toast("Water settings saved")};
 q("#ws-cal").onclick=()=>calendarReminders();
 const nb=q("#ws-notif");if(nb)nb.onclick=async()=>{if(W().notify&&Notification.permission==="granted"){W().notify=false;save();drawRoom();toast("App notifications off");return}
  const r=await Notification.requestPermission();if(r==="granted"){W().notify=true;W().lastNotify=Date.now();save();toast("App notifications on")}else toast("Notifications are blocked. Allow them for this app in Android settings.");drawRoom()};if(RM||document.hidden)waterTank()}
function calendarReminders(){const a=tmin(W().start),b=tmin(W().end),ev=W().every,d=dkey().replace(/-/g,""),stamp=new Date().toISOString().replace(/[-:]/g,"").slice(0,15)+"Z";
 const lines=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Op-Lock In//Water//EN","CALSCALE:GREGORIAN"];let n=0;
 for(let m=a;m<=b;m+=ev){const hh=String(Math.floor(m/60)).padStart(2,"0"),mm=String(m%60).padStart(2,"0");n++;
  lines.push("BEGIN:VEVENT",`UID:dailyhq-water-${hh}${mm}@dailyhq`,`DTSTAMP:${stamp}`,`DTSTART:${d}T${hh}${mm}00`,"DURATION:PT5M","RRULE:FREQ=DAILY",`SUMMARY:💧 Drink water (${W().step} ml)`,`DESCRIPTION:Log it in Op-Lock In. Goal ${fmtL(W().goal)} a day.`,"TRANSP:TRANSPARENT","BEGIN:VALARM","ACTION:DISPLAY","DESCRIPTION:Drink water","TRIGGER:PT0M","END:VALARM","END:VEVENT")}
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
const APP_NAME="Op-Lock In",APP_VERSION="v1.5",APP_OWNER="James";
function aboutSheet(){openSheet(`<div class="about"><img src="icon-192.png" alt="" width="84" height="84"><h2>${APP_NAME}</h2><span class="chip">${APP_VERSION}</span>
 <p class="made">Made for <b>${APP_OWNER}</b></p>
 <blockquote>Thank you for trying my app. I hope it can help you organize your life like it has done for me.</blockquote></div>
 <div class="btns" style="justify-content:center"><button class="link" id="ab-setup">App setup</button></div>`,root=>{root.querySelector("#ab-setup").onclick=()=>{closeSheet();openSettings()}})}
function openSettings(focus){const s=S.settings,hidden=Object.keys(ACCTS).reduce((n,a)=>n+(S.trades[a]||[]).filter(t=>t.hidden).length,0);
 openSheet(`<h2>App setup</h2><p class="desc">Everything is saved on this phone. Make a backup now and then.</p>
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
$("importfile").onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const d=JSON.parse(await f.text());if(d.v!==1||!d.trades||!d.journal)throw 0;S=d;save();closeSheet();renderAll();toast("Backup restored")}catch(x){toast("That file isn't a Op-Lock In backup")}e.target.value=""};

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
 {pal:4,go:["trades",{acct:"bob"}],k:()=>"Bob",s:()=>"Compared with yours",
  h:()=>{const b=tstats(["bob"],"All"),m=tstats(["poly","pred","cb","fut","dman"],"All");if(!b.items.length&&!m.items.length)return "Log Bob's trades and your own";return `Bob is ${b.w}–${b.l}, you're ${m.w}–${m.l}`},
  i:()=>"Bob's trades next to yours across Polymarket, Prediction and Derivatives.",
  f:()=>{const b=tstats(["bob"],"All"),m=tstats(["poly","pred","cb","fut","dman"],"All");return[["Bob P&L",pnlStr(b.pnl)],["Your P&L",pnlStr(m.pnl)],["Today",pnlStr(b.today+m.today)]]},b:()=>"See Bob's trades"}];
const rail=$("rail");
CARDS.forEach((cd,i)=>{const el=document.createElement("article");el.className="card";el.tabIndex=0;
 el.innerHTML=`<div class="surf"><canvas></canvas><div class="shade"></div><div class="glare"></div><div class="meta"><span>Op-Lock In / Feed</span><span>${String(i+1).padStart(2,"0")} / ${String(CARDS.length).padStart(2,"0")}</span></div>
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
 const P=PAL[pal%PAL.length];
 // + ring menu follows the scene: 60% the scene's main tones (outer two rings), 30% its lighter tone, 10% its accent (inner ring).
 const rs=document.documentElement.style;[P.L[3],P.L[2],P.L[1],P.L[0],P.road[0]].forEach((c,i)=>rs.setProperty("--q"+i,c));rs.setProperty("--qink",P.sky[0]);
 document.documentElement.style.setProperty("--glow",P.glow);document.documentElement.style.setProperty("--glow2",P.glow2);document.querySelector('meta[name=theme-color]').content=P.sky[0]}
function layout(){const n=CARDS.length;CARDS.forEach((cd,i)=>{let d=i-S.ui.card;if(d>n/2)d-=n;if(d<-n/2)d+=n;cd.el.className="card "+(d===0?"c":Math.abs(d)<=2?"s"+d:"far");cd.el.setAttribute("aria-current",d===0)});setAmbient(CARDS[S.ui.card].pal);renderDots()}
function renderDots(){let d=$("tdots");if(!d){d=document.createElement("div");d.id="tdots";d.className="tdots";$("theatre").appendChild(d)}d.innerHTML=CARDS.map((_,i)=>`<button aria-label="Card ${i+1}" class="${i===S.ui.card?"on":""}"><i></i></button>`).join("");d.querySelectorAll("button").forEach((b,i)=>b.onclick=()=>{pauseAuto(4000);S.ui.card=i;save();layout()})}
const step=d=>{S.ui.card=(S.ui.card+d+CARDS.length)%CARDS.length;save();layout()};
$("prev").onclick=()=>{pauseAuto(4000);step(-1)};$("next").onclick=()=>{pauseAuto(4000);step(1)};
addEventListener("keydown",e=>{if(S.view!=="home"||e.target.closest("input,select,textarea")||!$("sheetwrap").hidden)return;if(e.key==="ArrowLeft")step(-1);if(e.key==="ArrowRight")step(1)});
const drag={x:0,y:0,on:false,moved:false};
rail.addEventListener("pointerdown",e=>{autoLast=Date.now();if(e.target.closest(".cta"))return;drag.on=true;drag.moved=false;drag.x=e.clientX;drag.y=e.clientY});
addEventListener("pointermove",e=>{if(!drag.on)return;const dx=e.clientX-drag.x;if(Math.abs(dx)>8)drag.moved=true;if(!drag.moved)return;rail.querySelectorAll(".card").forEach(c=>{c.style.setProperty("--dx",dx*.55+"px");c.style.transitionDuration="0s"})});
const endDrag=e=>{if(!drag.on)return;drag.on=false;pauseAuto(2500);const dx=e.clientX-drag.x;rail.querySelectorAll(".card").forEach(c=>{c.style.transitionDuration="";c.style.setProperty("--dx","0px")});if(drag.moved&&Math.abs(dx)>50)step(dx<0?1:-1);setTimeout(()=>drag.moved=false,0)};
addEventListener("pointerup",endDrag);addEventListener("pointercancel",endDrag);
addEventListener("pointermove",e=>{if(RM||e.pointerType==="touch")return;$("atmo").style.setProperty("--px",((e.clientX/innerWidth-.5)*-28).toFixed(1)+"px");$("atmo").style.setProperty("--py",((e.clientY/innerHeight-.5)*-18).toFixed(1)+"px")});
function openCard(i){const cd=CARDS[i],el=cd.el;el.classList.remove("peek");if(cd.go[0]==="trades"&&cd.b()==="Set up sync"){openSettings("wallet");return}
 if(RM){go(...cd.go);return}const r=el.getBoundingClientRect(),cl=document.createElement("div");cl.className="expand";cl.style.cssText+=`left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;border-radius:16px;background-image:url(${el.querySelector("canvas").toDataURL("image/jpeg",.7)})`;document.body.appendChild(cl);
 cl.animate([{left:r.left+"px",top:r.top+"px",width:r.width+"px",height:r.height+"px",borderRadius:"16px"},{left:"0px",top:"0px",width:innerWidth+"px",height:innerHeight+"px",borderRadius:"0px"}],{duration:480,easing:"cubic-bezier(.16,1,.3,1)",fill:"forwards"})
 .onfinish=()=>{go(cd.go[0],{...(cd.go[1]||{}),instant:true});cl.animate([{opacity:1},{opacity:0}],{duration:360,easing:"ease-out",fill:"forwards"}).onfinish=()=>cl.remove()}}
document.addEventListener("click",e=>{if(!e.target.closest(".card"))CARDS.forEach(c=>c.el.classList.remove("peek"))});

/* ================= segmented controls ================= */
function segPlace(id){const s=$(id);if(!s)return;const hl=s.querySelector(".hl"),b=s.querySelector("button.on");if(b&&b.offsetWidth){hl.style.left=b.offsetLeft+"px";hl.style.width=b.offsetWidth+"px"}}
const segAll=()=>requestAnimationFrame(()=>{segPlace("acct");segPlace("tf")});





/* ================= routing + dock ================= */
const NAMES={home:"Home",today:"Today",trades:"Trades",journal:"Journal",food:"Food",smoke:"Smoke log",money:"Money"},PALOF={today:1,trades:0,journal:2,food:3,smoke:4,money:0};
function go(v,o={}){if(v==="food"){if(o.instant){v="today"}else{openFood(S.ui.who==="dog"?"dogs":"me");return}}S.view=v;if(v!=="home")layerOpen("page",()=>go("home"));else layerClosed("page");if(o.acct){S.ui.tsec=o.acct==="manual"?"pred":TSEC.some(s=>s.k===o.acct)?o.acct:"all";txHold()}if(o.book)S.ui.book=o.book;
 $("v-home").classList.toggle("off",v!=="home");document.querySelectorAll(".page").forEach(p=>p.classList.toggle("on",p.id==="p-"+v));document.body.classList.toggle("page-mode",v!=="home");
 document.querySelectorAll("#dock .tb").forEach(b=>b.classList.toggle("on",b.dataset.v===v||(b.dataset.k==="more"&&!["home","today","money"].includes(v))));qlog(false);
 $("crumb").textContent=NAMES[v];setGreet();morphWeek(v==="today",!!o.instant&&weekCompact===null);
 if(v==="home"){renderCards();layout();requestAnimationFrame(fitHome)}else{setAmbient(PALOF[v]);fitHome()}
 if(v==="today")setTimeout(()=>{if(typeof isHungry==="function"&&isHungry()&&Math.random()<.75)foodNote(true);else if(Math.random()<.5)waterNote();else foodNote()},1200);else{hideNote();hideFNote()}
 if(v==="today")setTimeout(()=>{const d=$("donext");if(!d||!$("p-today").classList.contains("on"))return;const r=d.getBoundingClientRect();if(r.bottom>innerHeight-90)d.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"center"})},450);
 if(v==="trades"){renderTrades();requestAnimationFrame(()=>txCenter(false));txSchedule();if(S.settings.wallet&&Date.now()-S.sync.last>60000)sync(false);if(NATIVE&&cbKey()&&Date.now()-((S.cbsync&&S.cbsync.last)||0)>120000)cbSync(false)}
 if(v==="journal")renderJournal();if(v==="today")renderToday();if(v==="food")renderFood();if(v==="smoke")renderSmoke();if(v==="money")renderMoney();
 save();scrollTo({top:0,behavior:o.instant?"auto":"smooth"});history.replaceState(null,"","#"+v)}
function glide(){}
/* ===== Light: a soft light follows your finger (or the mouse) across the background, and on Home the
   current card catches it: glow, warm title, slight tilt toward it. When you're not touching, tilting the
   phone slides the light across the card. Smoothed every frame so it feels physical; stops when idle. ===== */
(function(){const room=$("room");if(!room||RM)return;
 const HOVER=matchMedia("(hover:hover)").matches,T={x:.5,y:.4,i:0},C={x:.5,y:.4,i:0},Rm={t:0,c:0};
 let touching=false,lastTouch=0,mouseOn=false,running=false,tilt={x:.5,y:.4,t:0},base=null,litEl=null;
 const blocked=t=>t&&t.closest&&t.closest("#sheetwrap,#calm,#qlog,.tabbar,input,textarea,select");
 const kick=()=>{if(!running&&!document.hidden){running=true;requestAnimationFrame(frame)}};
 const at=(x,y)=>{T.x=x/innerWidth;T.y=y/innerHeight};
 function unlit(){if(!litEl)return;litEl.classList.remove("lit","hot");hot=false;const sf=litEl.querySelector(".surf");if(sf&&!document.body.classList.contains("hover")){sf.style.setProperty("--rx","0deg");sf.style.setProperty("--ry","0deg")}litEl=null}
 // Smooth and cheap: frame-rate independent easing, and only transforms/opacity change per frame (no gradient repaints).
 let lastT=0,rc=null,rcEl=null,rcT=0,hot=false;
 const ease=(rate,dt)=>1-Math.pow(1-rate,dt/16.7);
 function frame(ts){const now=Date.now(),dt=Math.min(64,lastT?ts-lastT:16.7);lastT=ts;const tiltLive=!HOVER&&now-tilt.t<1500&&S.view==="home"&&$("sheetwrap").hidden;
  if(!touching&&!mouseOn&&now-lastTouch>700){if(tiltLive){T.x=tilt.x;T.y=tilt.y;T.i=.5}else T.i=0}
  Rm.t=touching||mouseOn?T.i:0;
  const k=ease(touching?.5:mouseOn?.35:.12,dt);C.x+=(T.x-C.x)*k;C.y+=(T.y-C.y)*k;C.i+=(T.i-C.i)*ease(T.i>C.i?.3:.07,dt);Rm.c+=(Rm.t-Rm.c)*ease(Rm.t>Rm.c?.3:.07,dt);
  const px=C.x*innerWidth,py=C.y*innerHeight;room.style.transform=`translate3d(${px.toFixed(1)}px,${py.toFixed(1)}px,0)`;room.style.opacity=Rm.c.toFixed(3);
  // the card part is for touch and tilt only; desktop hover already has its own card effect
  const cd=S.view==="home"&&!HOVER&&CARDS[S.ui.card],el=cd&&cd.el;
  if(litEl&&litEl!==el)unlit();
  if(el&&C.i>.01){if(rcEl!==el||now-rcT>300){rc=el.getBoundingClientRect();rcEl=el;rcT=now}
   const gx=Math.max(0,Math.min(1,(px-rc.left)/rc.width)),gy=Math.max(0,Math.min(1,(py-rc.top)/rc.height)),sf=el.querySelector(".surf");
   if(litEl!==el){litEl=el;el.classList.add("lit")}el.style.setProperty("--gi",C.i.toFixed(2));
   const h=C.i>.45;if(h!==hot){hot=h;el.classList.toggle("hot",h)}
   if(sf){sf.style.setProperty("--glx",(gx*rc.width-rc.width).toFixed(1)+"px");sf.style.setProperty("--gly",(gy*rc.height-rc.height).toFixed(1)+"px");const m=drag.moved?0:C.i;sf.style.setProperty("--rx",((.5-gy)*5*m).toFixed(2)+"deg");sf.style.setProperty("--ry",((gx-.5)*7*m).toFixed(2)+"deg")}}
  else if(litEl&&C.i<=.01)unlit();
  if(!touching&&!mouseOn&&!tiltLive&&C.i<.004&&Rm.c<.004){running=false;lastT=0;room.style.opacity=0;unlit();return}  requestAnimationFrame(frame)}
 // touch: use touch events so the light keeps following while the page scrolls
 addEventListener("touchstart",e=>{if(blocked(e.target))return;const t=e.touches[0];touching=true;at(t.clientX,t.clientY);T.i=1;C.x=T.x;C.y=T.y;kick()},{passive:true});
 addEventListener("touchmove",e=>{if(!touching)return;const t=e.touches[0];at(t.clientX,t.clientY);kick()},{passive:true});
 const end=e=>{if(e.touches&&e.touches.length)return;touching=false;lastTouch=Date.now();T.i=0;kick()};addEventListener("touchend",end,{passive:true});addEventListener("touchcancel",end,{passive:true});
 // mouse: the background light follows the cursor
 if(HOVER){addEventListener("pointermove",e=>{if(e.pointerType!=="mouse")return;if(blocked(e.target)){if(mouseOn){mouseOn=false;T.i=0}return}mouseOn=true;at(e.clientX,e.clientY);T.i=.8;kick()},{passive:true});
  document.addEventListener("mouseleave",()=>{mouseOn=false;T.i=0})}
 // tilt (phones): light drifts with how you hold the phone, relative to your usual angle
 if(!HOVER)addEventListener("deviceorientation",e=>{if(e.gamma==null||e.beta==null)return;if(!base)base={g:e.gamma,b:e.beta};base.g+=(e.gamma-base.g)*.004;base.b+=(e.beta-base.b)*.004;
  let dx=Math.max(-25,Math.min(25,e.gamma-base.g)),dy=Math.max(-25,Math.min(25,e.beta-base.b));const a=(screen.orientation&&screen.orientation.angle)||0;
  if(a===90)[dx,dy]=[dy,-dx];else if(a===270)[dx,dy]=[-dy,dx];else if(a===180)[dx,dy]=[-dx,-dy];
  tilt.x=.5+dx/50*.9;tilt.y=.42+dy/50*.8;tilt.t=Date.now();if(S.view==="home")kick()});
 document.addEventListener("visibilitychange",()=>{if(!document.hidden)kick()})})();
/* week morph: open round dates <-> boxed strip (Today). FLIP: measure, switch layout, animate each piece from old spot */
let weekCompact=null;if(window.gsap&&window.Flip)gsap.registerPlugin(Flip);
/* Home fits one screen: size the card rail to the space between header and tab bar */
function fitHome(){const th=$("theatre"),rail=$("rail");if(!th||!rail)return;const home=S.view==="home";document.documentElement.classList.toggle("fit",home);
 if(!home){th.style.cssText="";rail.style.cssText="";return}
 const top=th.getBoundingClientRect().top,tb=$("dock").getBoundingClientRect().height,avail=Math.max(300,innerHeight-top-tb-14),narrow=innerWidth<=760;
 const dots=30,railH=avail-dots-6,heroH=railH,W=innerWidth,peek=narrow?14:Math.min(140,W*.08);
 const heroW=narrow?W-2*peek-16:Math.min(W-2*peek-2*28,heroH*2.1),sideW=narrow?W*.8:Math.min(heroW*.55,560),sideOff=heroW/2+sideW/2+(narrow?10:22);
 th.style.cssText=`min-height:${avail}px;height:${avail}px;--hero-h:${heroH}px;--hero-w:${Math.round(heroW)}px;--side-h:${Math.round(heroH*.86)}px;--side-w:${Math.round(sideW)}px;--side-off:${Math.round(sideOff)}px`;
 rail.style.cssText=`height:${railH}px;margin-top:4px`}
addEventListener("resize",()=>requestAnimationFrame(fitHome));
addEventListener("load",()=>fitHome());if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>fitHome());setTimeout(fitHome,400);
/* auto-swipe: glide to the next card every 6 s, pause while touched, hovered, or busy */
const AUTO_MS=6000;let autoPause=0,autoLast=Date.now(),mouseHover=false;rail.addEventListener("pointerover",e=>{if(e.pointerType==="mouse")mouseHover=true});rail.addEventListener("pointerleave",()=>mouseHover=false);document.addEventListener("visibilitychange",()=>{drag.on=false});
function pauseAuto(ms=12000){autoPause=Date.now()+ms;autoLast=Date.now()}
setInterval(()=>{if(S.view!=="home"||document.hidden||RM||!$("sheetwrap").hidden||(typeof calm!=="undefined"&&calm)||qOpen())return autoLast=Date.now();
 if(Date.now()<autoPause||drag.on||(mouseHover&&matchMedia("(hover:hover)").matches))return autoLast=Date.now();
 if(Date.now()-autoLast>=AUTO_MS){autoLast=Date.now();step(1)}},250);
function morphWeek(on,instant){const hd=document.querySelector(".hd");if(!hd)return;const wide=innerWidth>760;hd.classList.toggle("wide",wide);
 if(weekCompact===on&&!instant)return;const animate=!instant&&weekCompact!==null&&!RM;weekCompact=on;
 const chips=[...document.querySelectorAll(".hchip")],els=[...document.querySelectorAll("#week button strong,#week button span,#week button i"),...chips];
 const target=on&&wide?$("stripchips"):document.querySelector(".hchips");
 if(animate&&window.gsap&&window.Flip){const state=Flip.getState(els);chips.forEach(c=>target.appendChild(c));hd.classList.toggle("compact",on);
  Flip.from(state,{duration:.78,ease:"expo.inOut",scale:true,stagger:{each:.014,from:"start"},simple:true,onComplete:()=>els.forEach(e=>gsap.set(e,{clearProps:"transform"}))});return}
 const first=animate?els.map(e=>e.getBoundingClientRect()):null;
 chips.forEach(c=>target.appendChild(c));
 hd.classList.toggle("compact",on);if(!animate)return;
 els.forEach((e,i)=>{const a=first[i],b=e.getBoundingClientRect();if(!b.width||!a.width)return;const dx=a.left-b.left,dy=a.top-b.top,sx=a.width/b.width,sy=a.height/b.height;
  if(Math.abs(dx)<1&&Math.abs(dy)<1&&Math.abs(sx-1)<.02)return;
  e.animate([{transformOrigin:"top left",transform:`translate(${dx}px,${dy}px) scale(${sx},${sy})`},{transformOrigin:"top left",transform:"none"}],{duration:560,easing:"cubic-bezier(.2,.8,.2,1)",delay:i<21?i%7*18:0})})}
addEventListener("resize",()=>{if(weekCompact!==null)morphWeek(weekCompact,true)});
function greeting(){const h=new Date().getHours();return (h<5?"Good night":h<12?"Good morning":h<17?"Good afternoon":"Good evening")+", "+(typeof APP_OWNER!=="undefined"?APP_OWNER:"James")}
function setGreet(){const g=$("greet");if(g)g.textContent=["home","today"].includes(S.view)?greeting():NAMES[S.view]||greeting()}
document.querySelectorAll("#dock .tb[data-v]").forEach(b=>b.onclick=()=>go(b.dataset.v));
document.querySelector('#dock [data-k="more"]').onclick=()=>moreSheet();
$("setbtn").onclick=()=>aboutSheet();$("syncbtn").onclick=()=>sync(true);$("streakbtn").onclick=e=>openStreak(e.currentTarget);$("donebtn").onclick=()=>go("today");$("levelpill").onclick=()=>go("today");
/* quick log (+) */
const qOpen=()=>$("qlog").classList.contains("open");
function qlog(open){const q=$("qlog"),p=$("plusbtn");if(!q)return;q.classList.toggle("open",!!open);q.setAttribute("aria-hidden",!open);p.classList.toggle("open",!!open);p.setAttribute("aria-expanded",!!open);if(open)try{navigator.vibrate&&navigator.vibrate(12)}catch(e){}}
$("plusbtn").onclick=e=>{e.stopPropagation();qlog(!qOpen())};
$("qscrim").onclick=()=>qlog(false);addEventListener("keydown",e=>{if(e.key==="Escape")qlog(false)});
$("qlog").querySelectorAll("[data-q]").forEach(b=>b.onclick=()=>{const q=b.dataset.q;qlog(false);
 if(q==="trade"){setTimeout(tradePicker,260);return}
 if(q==="purchase"){go("money");mTab("log");setTimeout(()=>$("m-amt")&&$("m-amt").focus(),350)}
 if(q==="water")addWater(W().step,b);
 if(q==="task"){go("today");setTimeout(()=>{$("nt").scrollIntoView({block:"center"});$("nt").focus()},350)}
 if(q==="puff"){const X=SM();if(X.active){X.active.puffs++;save();toast(`Puff logged · ${X.active.puffs} this session`)}else{startSmoke(S.ui.smokeLimit??5);SM().active.puffs=1;save()}go("smoke")}
 if(q==="calm")openCalm()});
/* More sheet */
const SECTIONS=[["trades","Trades","linear-gradient(160deg,#2BB08C,#167A62)","#fff",'<path d="M4 17l5-5 4 4 7-8"/><path d="M15 8h5v5"/>'],
 ["journal","Journal","linear-gradient(160deg,#E9A46C,#B86E3C)","#fff",'<path d="M6 4h11a1 1 0 0 1 1 1v15H7a2 2 0 0 1-2-2V5a1 1 0 0 1 1-1z"/><path d="M5 18a2 2 0 0 1 2-2h11M9 8h5"/>'],
 ["food","Food","linear-gradient(160deg,#8DBE45,#5A8424)","#fff",'<path d="M7 3v18M5 3v5a2 2 0 0 0 4 0V3M17 21V3c-2 1.5-3 4-3 7h3"/>'],
 ["smoke","Smoke log","linear-gradient(160deg,#8C80E8,#5A4DB8)","#fff",'<path d="M3 9h11a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3"/>']];
function moreSheet(){
 openSheet(`<h2>More</h2><h3 class="rh">Sections</h3><div class="sclist">${SECTIONS.map(([v,n,bg,fg,ic])=>`<button class="scitem" data-go="${v}"><span class="tile sec" style="background:${bg};color:${fg}"><svg viewBox="0 0 24 24">${ic}</svg></span>${n}</button>`).join("")}</div>
 <h3 class="rh">Shortcuts</h3><div class="sclist">${SHORTCUTS.map((s,i)=>`<button class="scitem" data-sc="${i}"><span class="tile" style="background:${s.bg};color:${s.fg}">${esc(s.tile)}</span>${esc(s.name)}</button>`).join("")}</div>
 <div class="btns" style="justify-content:center"><button class="link" id="mo-set">Settings</button></div>`,root=>{
  root.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{closeSheet();go(b.dataset.go)});
  root.querySelectorAll("[data-sc]").forEach(b=>b.onclick=()=>{closeSheet();openShortcut(SHORTCUTS[+b.dataset.sc])});
  root.querySelector("#mo-set").onclick=()=>{closeSheet();aboutSheet()}})}

/* ================= orbit ================= */
function orbit(o){$("orbit").classList.toggle("open",o);$("scrim").classList.toggle("on",o);$("orbit").setAttribute("aria-hidden",!o)}
$("scrim").onclick=()=>orbit(false);
$("orbit").querySelectorAll(".olab").forEach(b=>b.onclick=()=>{orbit(false);const a=b.dataset.a;
 if(a==="won"||a==="lost"){go("trades");setTimeout(()=>quickLog(a==="won",$(a)),380)}
 if(a==="task"){go("today");setTimeout(()=>$("nt").focus(),380)}
 if(a==="entry"){go("journal");setTimeout(()=>editEntry(S.ui.book),380)}});

/* ================= boot ================= */
function renderAll(){syncRepSelect();renderWeek();renderToday();renderWater();renderTrades();renderJournal();renderFood();renderCards();if(S.view==="home")layout()}
tick();setInterval(tick,10000);
rail.classList.add("still");paintCards();renderAll();layout();requestAnimationFrame(()=>requestAnimationFrame(()=>rail.classList.remove("still")));
const start=(location.hash||"").slice(1);if(start==="dogs"){S.ui.who="dog";go("today",{instant:true});setTimeout(()=>openFood("dogs"),500)}else if(start==="calm"){go("smoke",{instant:true});setTimeout(openCalm,300)}
else go(NAMES[start]?start:"home",{instant:true});
addEventListener("resize",()=>{glide();segAll()});
setInterval(waterTick,60000);setInterval(foodTick,60000);setTimeout(foodTick,6000);setTimeout(waterTick,4000);setInterval(taskTick,30000);setTimeout(taskTick,2000);$("alertsbtn").onclick=()=>NATIVE?nativeAlertsSheet():alertsSheet();if(NATIVE){nativeInit();document.documentElement.classList.add("native")}$("waterbtn").onclick=e=>openWater(e.currentTarget);
document.addEventListener("visibilitychange",()=>{if(!document.hidden){tick();waterTick();taskTick();scheduleSoon();if(S.settings.wallet&&Date.now()-S.sync.last>120000)sync(false)}});
if(S.settings.wallet&&Date.now()-S.sync.last>120000)setTimeout(()=>sync(false),800);
if("serviceWorker" in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("sw.js").catch(()=>{});
