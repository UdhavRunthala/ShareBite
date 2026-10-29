export const neighbourhoods = [
  ['C-Scheme', 75.8032, 26.9060], ['Malviya Nagar', 75.8136, 26.8545], ['Vaishali Nagar', 75.7432, 26.9124],
  ['Raja Park', 75.8281, 26.8943], ['Mansarovar', 75.7664, 26.8518], ['Bani Park', 75.7892, 26.9320],
  ['Civil Lines', 75.7769, 26.9108], ['Jagatpura', 75.8433, 26.8394], ['Tonk Road', 75.8005, 26.8739],
  ['Johari Bazaar', 75.8267, 26.9203], ['Sodala', 75.7680, 26.9020], ['Adarsh Nagar', 75.8310, 26.9040],
];
export const donors = [
  ['The Saffron Table', 'restaurant'], ['Gulab Heritage Hotel', 'hotel'], ['Annapurna Wedding Gardens', 'wedding venue'],
  ['Roastery Lane Café', 'cafe'], ['Meera Sharma', 'household'], ['Pink City Bakehouse', 'bakery'], ['Thali & Co.', 'restaurant'],
  ['Arjun Mehta', 'individual'], ['Amber Courtyard', 'hotel'], ['Mitti Kitchen', 'restaurant'], ['The Daily Loaf', 'bakery'],
  ['Shubham Celebration Lawn', 'wedding venue'], ['Priya Agarwal', 'household'], ['Nukkad Coffee House', 'cafe'],
  ['Rasoi by Ritu', 'household'], ['Chandni Palace Hotel', 'hotel'], ['Govindam Sweets', 'bakery'], ['Kunal Joshi', 'individual'],
  ['Green Bowl Jaipur', 'restaurant'], ['Utsav Banquet', 'wedding venue'], ['The Sunday Oven', 'bakery'], ['Neha Bansal', 'household'],
  ['Saanjh Rooftop Kitchen', 'restaurant'], ['Haveli Breakfast Club', 'cafe'], ['Vikram Singh', 'individual'], ['Aangan Family Kitchen', 'restaurant'],
];
export const ngos = [
  ['Udaan Community Kitchen', 'A warm meal can change the shape of a day. Our volunteers serve children, daily-wage workers and families across central Jaipur.', 650],
  ['Roti for All Jaipur', 'Neighbourhood volunteers coordinate evening meals and dignified distribution near labour gathering points.', 800],
  ['Aashray Care Collective', 'We support older neighbours and families in temporary shelters with regular, nourishing meals.', 450],
  ['Muskaan Children’s Trust', 'After-school nutrition and community support for children in underserved Jaipur neighbourhoods.', 300],
  ['Sahyog Food Circle', 'Local kitchens and trained volunteers turn surplus into dependable community meals.', 400],
  ['Nayi Disha Foundation', 'Practical food support for migrant families, with collection teams in eastern Jaipur.', 250],
  ['Seva Setu Jaipur', 'Connecting generous kitchens with community shelters through reliable daily pickup routes.', 500],
  ['Aangan Community Care', 'Women-led neighbourhood groups supporting family nutrition and shared community kitchens.', 220],
  ['Sukoon Senior Support', 'Home-delivered meals and companionship for older residents who need a little extra support.', 180],
  ['Umeed Meals Network', 'Student volunteers coordinate weekend meal distributions and emergency food support.', 350],
  ['Jan Saathi Collective', 'A community-led food network serving workers and families around Mansarovar.', 420],
  ['Ek Thaali Initiative', 'Small, frequent collections help our teams deliver fresh food close to where it is prepared.', 200],
  ['Navjeevan Outreach', 'A new volunteer kitchen building its first collection routes in Jagatpura.', 150],
  ['Prerna Neighbourhood Trust', 'Community volunteers preparing to support households in Vaishali Nagar.', 180],
  ['Saath Meal Mission', 'A proposed food distribution service awaiting corrected registration documents.', 120],
];
const imageIds = ['1546833999-b9f581a1996d','1565557623262-b51c2513a641','1631452180519-c014fe946bc7','1512621776951-a57141f2eefd','1509440159596-0249088772ff','1555507036-ab1f4038808a','1601050690597-df0568f70950','1547592180-85f173990554','1567620905732-2d1ec7ab7445','1565299624946-b28f40a0ae38','1498837167922-ddd27525d352','1519869325930-281384150729','1484723091739-30a097e8f929','1565958011703-44f9829ba187','1546069901-ba9599a7e63c','1540189549336-e6e99c3679fe','1473093226795-af9932fe5856','1504674900247-0877df9cc836','1574484284002-952d92456975','1603894584373-5ac82b2ae398'];
export const sourcePhotos = imageIds.map(id => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`);
export const photos = imageIds.map((_id,index)=>`/seed-assets/food-${String(index+1).padStart(2,'0')}.jpg`);
export const foods = [
  ['Dal makhani & jeera rice','Cooked meals','veg','Freshly prepared slow-cooked dal with fragrant cumin rice. Packed separately for easy serving.',['milk']],
  ['Vegetable biryani','Cooked meals','veg','Fragrant basmati rice with seasonal vegetables, herbs and mild spices.',['nuts']],
  ['Paneer butter masala','Cooked meals','veg','Creamy paneer curry, prepared for lunch service and kept covered in food-safe containers.',['milk']],
  ['Puri sabzi meal boxes','Cooked meals','veg','Soft puris with homestyle potato curry, individually packed and ready for collection.',['wheat']],
  ['Fresh sourdough loaves','Bakery','veg','Today’s unsold artisan loaves, carefully wrapped. Lovely for breakfast or sandwiches.',['wheat']],
  ['Assorted breakfast pastries','Bakery','veg','Fresh croissants and fruit pastries from our morning bake.',['wheat','milk']],
  ['Vegetarian thali boxes','Cooked meals','veg','Complete meals with dal, seasonal sabzi, rice and rotis. A balanced plate, ready to share.',['wheat','milk']],
  ['Seasonal fruit baskets','Produce','veg','Washed apples, bananas and oranges, sorted for freshness and packed in reusable crates.',[]],
  ['Idli & coconut chutney','Cooked meals','veg','Soft steamed idlis with separately packed coconut chutney. Please collect promptly.',[]],
  ['Chicken biryani boxes','Cooked meals','non-veg','Freshly cooked chicken biryani packed in sealed meal containers.',['milk']],
  ['Packed biscuits & juice','Packaged','veg','Unopened snack packs within their labelled expiry dates. Suitable for community snack drives.',['wheat']],
  ['Gulab jamun & mithai','Sweets','veg','Fresh celebration sweets, separated into small boxes for easy distribution.',['milk','nuts']],
  ['Rajma chawal','Cooked meals','veg','Comforting kidney bean curry with steamed rice, prepared this afternoon.',[]],
  ['Aloo paratha & curd','Cooked meals','veg','Homestyle stuffed flatbreads with separately sealed curd portions.',['wheat','milk']],
  ['Vegetable pulao','Cooked meals','veg','Lightly spiced rice with peas, carrots and beans. Packed and ready for a nearby team.',[]],
  ['Fresh bread rolls','Bakery','veg','Soft dinner rolls baked today, ideal for soup kitchens and breakfast rounds.',['wheat']],
  ['Chole & kulcha','Cooked meals','veg','Hearty chickpea curry with soft kulchas, packed separately to preserve freshness.',['wheat']],
  ['Garden salad bowls','Produce','veg','Fresh seasonal vegetables, washed and portioned. Dressings packed separately.',[]],
  ['Masala khichdi','Cooked meals','veg','Gentle rice and lentil khichdi with vegetables. Easy to serve for all ages.',[]],
  ['Mixed vegetable curry','Cooked meals','veg','Seasonal vegetables in a mild tomato gravy, packed in food-grade containers.',[]],
];
