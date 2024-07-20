/********************************************************************************
*  WEB322 – Assignment 05
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Hill Bhupendrabhai Patel Student ID: 132031220 Date: 19th July 2024
*
*  Published URL: ___________________________________________________________
*
********************************************************************************/


const legoData = require("./modules/legoSets");
const express = require('express');
const path = require('path');
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

// Middleware
app.use(express.static('public'));
app.use(express.json()); // For parsing JSON bodies
app.use(express.urlencoded({ extended: true })); // For parsing URL-encoded bodies
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
  res.render("home");
});

app.get('/about', (req, res) => {
  res.render("about");
});

app.get("/lego/sets", async (req, res) => {
  try {
    let sets = req.query.theme ? await legoData.getSetsByTheme(req.query.theme) : await legoData.getAllSets();
    res.render("sets", { sets });
  } catch (err) {
    res.status(404).render("404", { message: err });
  }
});

app.get("/lego/sets/:num", async (req, res) => {
  try {
    let set = await legoData.getSetByNum(req.params.num);
    res.render("set", { set });
  } catch (err) {
    res.status(404).render("404", { message: err });
  }
});

app.get('/lego/addSet', (req, res) => {
  legoData.getAllThemes()
    .then(themeData => {
      res.render('addSet', { themes: themeData });
    })
    .catch(err => {
      res.status(500).render('500', { message: `Error: ${err}` });
    });
});

app.post('/lego/addSet', (req, res) => {
  const { name, year, num_parts, img_url, theme_id, set_num } = req.body;

  if (!name || !year || !num_parts || !theme_id || !set_num) {
    return legoData.getAllThemes()
      .then(themeData => {
        res.status(400).render('addSet', { themes: themeData, error: 'All fields are required.' });
      })
      .catch(err => {
        res.status(500).render('500', { message: `Error: ${err}` });
      });
  }

  const newSet = { name, year, num_parts, img_url, theme_id, set_num };

  legoData.addSet(newSet)
    .then(() => {
      res.redirect('/lego/sets');
    })
    .catch(err => {
      res.status(500).render('500', { message: `Error: ${err}` });
    });
});

// GET route for displaying the edit form
app.get('/lego/editSet/:num', async (req, res) => {
  try {
    const setData = await legoData.getSetByNum(req.params.num);
    const themeData = await legoData.getAllThemes();
    res.render('editSet', { themes: themeData, set: setData });
  } catch (err) {
    res.status(404).render('404', { message: `Error: ${err}` });
  }
});

// POST route for handling form submission
app.post('/lego/editSet', (req, res) => {
  const { set_num, name, year, num_parts, img_url, theme_id } = req.body;

  // Create the updated set object
  const updatedSet = {
    name,
    year,
    num_parts,
    img_url,
    theme_id
  };

  legoData.editSet(set_num, updatedSet)
    .then(() => {
      res.redirect('/lego/sets');
    })
    .catch(err => {
      res.status(500).render('500', { message: `Error: ${err}` });
    });
});

// GET route for deleting a set
app.get('/lego/deleteSet/:num', (req, res) => {
  legoData.deleteSet(req.params.num)
    .then(() => {
      res.redirect('/lego/sets');
    })
    .catch(err => {
      res.status(500).render('500', { message: `Error: ${err}` });
    });
});


// Error Handlers
app.use((req, res, next) => {
  res.status(404).render("404", { message: "I'm sorry, we're unable to find what you're looking for" });
});

app.use((err, req, res, next) => {
  res.status(500).render("500", { message: `HTTP Error 500 - Internal Server Error: ${err.message}` });
});

// Start Server
legoData.initialize().then(() => {
  app.listen(HTTP_PORT, () => { console.log(`Server listening on: ${HTTP_PORT}`) });
});
