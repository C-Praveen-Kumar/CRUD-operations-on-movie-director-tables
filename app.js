const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");

const app = express();
app.use(express.json());

let database = null;

const initializeDBAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running https://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error ${error.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertDBOjectToResponseObject = (DBObject) => {
  return {
    movieId: DBObject.movie_id,
    directorId: DBObject.director_id,
    movieName: DBObject.movie_name,
    leadActor: DBObject.lead_actor,
  };
};
const convertDirectorDBOjectToResponseObject = (DBObject) => {
  return {
    directorId: DBObject.director_id,
    directorName: DBObject.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMovieQuery = `
    SELECT *
    FROM movie;`;
  const movieArray = await database.all(getMovieQuery);
  response.send(
    movieArray.map((eachmovie) => ({ movieName: eachmovie.movie_name }))
  );
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `
    INSERT INTO 
        movie(director_id, movie_name, lead_actor)
    VALUES 
        (${directorId},'${movieName}', '${leadActor}');`;
  const movie = await database.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getmovieQuery = `
    SELECT *
    FROM movie
    WHERE movie_id = ${movieId};`;
  const movie = await database.get(getmovieQuery);
  response.send(convertDBOjectToResponseObject(movie));
});

app.put("/movies/:movieId", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovieQuery = `
    UPDATE 
        movie
    SET 
        director_id =${directorId},
        movie_name ='${movieName}', 
        lead_actor='${leadActor}'
    WHERE 
        movie_id = ${movieId};
    `;
  await database.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    DELETE FROM 
        movie
    WHERE 
        movie_id = ${movieId};`;
  await database.run(getMovieQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getMovieQuery = `
    SELECT *
    FROM director;`;
  const movieArray = await database.all(getMovieQuery);
  response.send(
    movieArray.map((eachdirector) =>
      convertDirectorDBOjectToResponseObject(eachdirector)
    )
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMovieQuery = `
    SELECT 
        movie_name
    FROM 
        movie 
    WHERE 
        director_id = '${directorId}';`;
  const movieArray = await database.all(getDirectorMovieQuery);
  response.send(
    movieArray.map((eachmovie) => ({ movieName: eachmovie.movie_name }))
  );
});

module.exports = app;
