const express = require('express');

const Category = require('../models/category');
const User = require('../models/user');

const router = express.Router();

const STATUS = {
  OK: 200,
  CREATED: 201,
  EXISTS: 409,
  NOT_FOUND: 404,
}

const shuffleArray = array => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (e) {
    res.send('error occurred: ' + e);
  }
});

router.post('/by-lesson', async (req, res) => {
  try {
    const { body } = req;
    const { lesson } = body;
    const categories = await Category.find({ Lesson: lesson });
    res.status(200).json({ categories });
  } catch (err) {
    res.status(401).json({error: err});
  }
});

router.post('/by-lesson-id', async (req, res) => {
  try {
    const { body } = req;
    const { lesson, id } = body;
    const categories = await Category.findOne({ Lesson: lesson, id });
    res.status(200).json({ categories });
  } catch (err) {
    res.status(401).json({error: err});
  }
})

router.get('/getId', async (req, res) => {
  const { id } = req.query;
  try {
    const category = await Category.findOne({ _id: id });
    res.json(category);
  } catch (e) {
    res.send('error occurred');
  }
});

router.get('/getName', async (req, res) => {
  const { name } = req.query;
  try {
    const category = await Category.findOne({ name: name });
    res.json(category);
  } catch (e) {
    res.send('error occurred');
  }
});

router.put('/add', async (req, res) => {
  try {
    console.log(req.body)
    const existing_category = await Category.findOne({ Name: req.body.unit });
    const question = req.body.name;
    if (existing_category === null) {
      let new_category = {
        Lesson: req.body.lesson,
        Name: req.body.unit,
        Beginner: [],
        Waystage: [],
        Advanced: [],
        study_guide: req.body.study_guide,
        id: req.body.id
      }
      if (req.body.difficulty == "Beginner") {
        new_category.Beginner.push({
          Question: question,
          Answers: req.body.answers,
          Correct: req.body.correct
        })
      } else if (req.body.difficulty == "Waystage") {
        new_category.Waystage.push({
          Question: question,
          Answers: req.body.answers,
          Correct: req.body.correct
        })
      } else if (req.body.difficulty == "Advanced") {
        new_category.Advanced.push({
          Question: question,
          Answers: req.body.answers,
          Correct: req.body.correct
        })
      }
      await Category.create(new_category);
      res.status(STATUS.CREATED);
      res.json(new_category);
    } else {
      if (question === null) {
        res.status(STATUS.EXISTS);
        res.json({});
      } else {
        if (req.body.difficulty == "Beginner") {
          existing_category.Beginner.push({
            Question: question,
            Answers: req.body.answers,
            Correct: req.body.correct
          })
          await Category.findOneAndUpdate({ Name: req.body.unit },
            { Beginner: existing_category.Beginner })
        } else if (req.body.difficulty == "Waystage") {
          existing_category.Waystage.push({
            Question: question,
            Answers: req.body.answers,
            Correct: req.body.correct
          })
          await Category.findOneAndUpdate({ Name: req.body.unit },
            { Waystage: existing_category.Waystage })
        } else if (req.body.difficulty == "Advanced") {
          existing_category.Advanced.push({
            Question: question,
            Answers: req.body.answers,
            Correct: req.body.correct
          })
          await Category.findOneAndUpdate({ Name: req.body.unit },
            { Advanced: existing_category.Advanced })
        }
        res.status(STATUS.CREATED);
        res.json(question);
      }
    }
  } catch (e) {
    console.error("error:::", e)
    res.send('error occurred: ' + e);
  }
});

router.post('/lesson-progress', async (req, res) => {
  try {
    const { body } = req;
    const { lesson, progress, username } = body;
    const { unit, level } = progress;
    const category = await Category.findOne({
      Lesson: lesson,
      id: unit,
    });
    const { Beginner, Waystage, Advanced } = category;

    const user = await User.findOne({
      username
    });
    const { difficultyScores } = user;

    switch (level) {
      case 0:
        res.json({questions: Beginner.slice(0, Math.floor(Beginner.length / 3))});
        break;
      case 1:
        res.json({questions: Beginner.slice(Beginner.length / 3, (2 * Beginner.length / 3))});
        break;
      case 2:
        res.json({questions: Beginner.slice((2 * Beginner.length / 3), Beginner.length)})
        break;
      case 3:
        shuffleArray(Beginner);
        res.json({questions: Waystage.slice(0, Waystage.length / 3).concat(difficultyScores[lesson].Beginner).concat(Beginner).slice(0, 10) });
        break;
      case 4:
        shuffleArray(Beginner);
        res.json({questions: Waystage.slice(Waystage.length / 3, (2 * Waystage.length / 3)).concat(difficultyScores[lesson].Beginner).concat(Beginner).slice(0, 10)  })
        break;
      case 5:
        shuffleArray(Beginner);
        res.json({questions: Waystage.slice((2 * Waystage.length / 3), Waystage.length).concat(difficultyScores[lesson].Beginner).concat(Beginner).slice(0, 10)  })
        break;
      case 6:
        shuffleArray(Beginner);
        shuffleArray(Waystage);
        res.json({questions: Advanced.slice(0, Advanced.length / 4).concat(difficultyScores[lesson].Waystage).concat(difficultyScores[lesson].Beginner).concat(Waystage).concat(Beginner).slice(0, 10)  })
        break;
      case 7:
        shuffleArray(Beginner);
        shuffleArray(Waystage);
        res.json({questions: Advanced.slice(Advanced.length / 4, (2 * Advanced.length / 4)).concat(difficultyScores[lesson].Waystage).concat(difficultyScores[lesson].Beginner).concat(Waystage).concat(Beginner).slice(0, 10)  })
        break;
      case 8:
        shuffleArray(Beginner);
        shuffleArray(Waystage);
        res.json({questions: Advanced.slice((2 * Advanced.length / 4), (3 * Advanced.length / 4)).concat(difficultyScores[lesson].Waystage).concat(difficultyScores[lesson].Beginner).concat(Waystage).concat(Beginner).slice(0, 10)  })
        break;
      case 9:
        shuffleArray(Beginner);
        shuffleArray(Waystage);
        res.json({questions: Advanced.slice((3 * Advanced.length / 4), Advanced.length).concat(difficultyScores[lesson].Waystage).concat(difficultyScores[lesson].Beginner).concat(Waystage).concat(Beginner).slice(0, 10)  })
        break;
      default:
        res.status(404).json({ message: "level out of bounds" });
    }
  } catch (err) {
    res.status(400).json({error: err})
  }
});

module.exports = router;