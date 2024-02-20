require('dotenv').config()
const express = require('express') 
const cors = require('cors') 
const Note = require('./models/note')
const app = express() 
const requestLogger = (request, response, next) => {
    console.log('Method:', request.method) 
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('----')
    next() // yields control over to the next middleware
}

// MIDDLEWARE
app.use(cors())
app.use(express.json())
app.use(express.static('dist'))
app.use(requestLogger)

let notes = [
    {
        id: 1, 
        content: "HTML is easy", 
        important: true
    }, 
    {
        id: 2, 
        content: "Browser can execute only JavaScript", 
        important: false 
    }, 
    {
        id: 3, 
        content: "GET and POST are the most important methods of HTTP protocol", 
        important: true
    }, 
    {
        id: 4, 
        content: "CSS is hard", 
        important: false
    }
]

app.get('/', (request, response) => {
    // response.send('<h1>Hello world!</h1><h2>I am groot</h2>')
    response.send('./dist/index.html')
})

app.get('/api/notes', (request, response) => {
    Note
    .find({})
    .then(notes => {
        response.json(notes)
        // mongoose.connection.close()
    })
})

app.get('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    const note = notes.find(note => note.id === id)

    if (note) {
        response.json(note) 
    } else {
        response.status(404).end()
    }
})

app.delete('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    notes = notes.filter(note => note.id !== id) 
    response.status(204).end()
})

const generateId = () => {
    const maxId = notes.length > 0
        ? Math.max(...notes.map(n => n.id))
        : 0
    return maxId + 1 
}

app.post('/api/notes', (request, response) => {
    const body = request.body 
    // console.log(body)

    if (!body.content) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    const note = {
        content: body.content, 
        important: Boolean(body.important) || false, 
        id: generateId()
    }

    notes = notes.concat(note) 

    response.json(note)
})

const unkwownEndpoint = (request, response) => {
    response.status(404).send({
        error: 'unknown endpoint'
    })
}

app.use(unkwownEndpoint)

const PORT = process.env.PORT
app.listen(PORT)
console.log(`Server running on port ${PORT}`) 
