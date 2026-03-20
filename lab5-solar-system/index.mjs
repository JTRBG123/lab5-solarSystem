import express from 'express';
const planets = (await import('npm-solarsystem')).default;
const app = express();

const planetNames = [
   'Mercury',
   'Venus',
   'Earth',
   'Mars',
   'Jupiter',
   'Saturn',
   'Uranus',
   'Neptune',
   'Pluto'
];

const fallbackSolarImages = [
   'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001861/GSFC_20171208_Archive_e001861~large.jpg',
   'https://images-assets.nasa.gov/image/PIA18033/PIA18033~large.jpg',
   'https://images-assets.nasa.gov/image/PIA03149/PIA03149~large.jpg',
   'https://images-assets.nasa.gov/image/PIA00405/PIA00405~large.jpg'
];

const studentName = process.env.STUDENT_NAME || 'Joseph R';
const pixabayApiKey = process.env.PIXABAY_API_KEY;
const nasaApiKey = process.env.NASA_API_KEY || 'DEMO_KEY';
const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.locals.planetNames = planetNames;
app.locals.studentName = studentName;

async function getRandomSolarImage() {
   if (!pixabayApiKey) {
      const fallbackIndex = Math.floor(Math.random() * fallbackSolarImages.length);
      return fallbackSolarImages[fallbackIndex];
   }

   try {
      const randomImageResponse = await fetch(
         `https://pixabay.com/api/?key=${pixabayApiKey}&per_page=50&orientation=horizontal&q=solar%20system`
      );
      const randomImageData = await randomImageResponse.json();

      if (!randomImageData.hits || randomImageData.hits.length === 0) {
         const fallbackIndex = Math.floor(Math.random() * fallbackSolarImages.length);
         return fallbackSolarImages[fallbackIndex];
      }

      const randomIndex = Math.floor(Math.random() * randomImageData.hits.length);
      const selected = randomImageData.hits[randomIndex];
      return selected.largeImageURL || selected.webformatURL || selected.previewURL;
   } catch (error) {
      const fallbackIndex = Math.floor(Math.random() * fallbackSolarImages.length);
      return fallbackSolarImages[fallbackIndex];
   }
}

//routes
//root route
app.get('/', async (req, res) => {
   const randomImageURL = await getRandomSolarImage();
   res.render('home.ejs', { image: randomImageURL });
});

//routes
//root route
// app.get('/mercury', (req, res) => {
//     let mercuryInfo = planets.getMercury();
//     console.log(mercuryInfo);
//     res.render('mercury.ejs', {mercuryInfo})
// });

app.get('/planetInfo', (req, res) => {
   const planet = req.query.planet;

   if (!planetNames.includes(planet)) {
      return res.status(400).send('Invalid planet requested.');
   }

   const planetInfo = planets[`get${planet}`]();
   const detailEntries = Object.entries(planetInfo).filter(([key]) => key !== 'image' && key !== 'websiteLink');
   res.render('planet.ejs', { planetInfo, planet, detailEntries });
});

app.get('/asteroids', (req, res) => {
   const asteroidsInfo = planets.getAsteroids();
   res.render('spaceObject.ejs', {
      title: 'Asteroids',
      objectInfo: asteroidsInfo
   });
});

app.get('/comets', (req, res) => {
   const cometsInfo = planets.getComets();
   res.render('spaceObject.ejs', {
      title: 'Comets',
      objectInfo: cometsInfo
   });
});

app.get('/nasaPod', async (req, res) => {
   const nasaPodResponse = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${nasaApiKey}`);
   const nasaPodData = await nasaPodResponse.json();
   const mediaUrl = nasaPodData.url || nasaPodData.hdurl || nasaPodData.thumbnail_url;
   res.render('nasaPod.ejs', { nasaPodData, mediaUrl });
});


app.listen(port, () => {
   console.log(`server started on port ${port}`);
});

