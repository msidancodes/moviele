import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { MovieService } from "./src/lib/movieService";
import { evaluateGuess, normalizeTitle } from "./src/lib/gameLogic";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const movieService = new MovieService();

  // API Routes
  app.get("/api/movies/daily", async (req, res) => {
    try {
      const date = (req.query.date as string) || new Date().toISOString().split("T")[0];
      const movie = await movieService.getDailyMovie(date);
      
      res.json({
        gameId: `daily-${date}`,
        mode: "daily",
        length: movie.normalizedTitle.length,
        maxAttempts: Math.min(10, Math.max(6, movie.normalizedTitle.length + 1)),
      });
    } catch (error) {
      console.error("Error fetching daily movie:", error);
      res.status(500).json({ error: "Failed to fetch daily movie" });
    }
  });

  app.get("/api/movies/random", async (req, res) => {
    try {
      const seed = Math.random().toString(36).substring(7);
      const movie = await movieService.getRandomMovie();
      
      // We store the random movie in a simple memory cache mapped to the seed
      // For a production app this would be Redis or similar
      movieService.cacheRandomMovie(seed, movie);

      res.json({
        gameId: `random-${seed}`,
        mode: "random",
        length: movie.normalizedTitle.length,
        maxAttempts: Math.min(10, Math.max(6, movie.normalizedTitle.length + 1)),
      });
    } catch (error) {
      console.error("Error fetching random movie:", error);
      res.status(500).json({ error: "Failed to fetch random movie" });
    }
  });

  app.post("/api/game/guess", async (req, res) => {
    try {
      const { gameId, mode, guess, date } = req.body;
      
      if (!guess) {
        return res.status(400).json({ status: "invalid", message: "Guess is required" });
      }

      const normalizedGuess = normalizeTitle(guess);

      let targetMovie;
      if (mode === "daily") {
        targetMovie = await movieService.getDailyMovie(date || new Date().toISOString().split("T")[0]);
      } else {
        const seed = gameId.replace("random-", "");
        targetMovie = movieService.getCachedRandomMovie(seed);
      }

      if (!targetMovie) {
        return res.status(404).json({ error: "Game not found" });
      }

      if (normalizedGuess.length !== targetMovie.normalizedTitle.length) {
        return res.status(400).json({ status: "invalid", message: "Invalid length" });
      }

      // Validate if the guess is a real movie title
      const isValidMovie = await movieService.validateMovieGuess(normalizedGuess);
      if (!isValidMovie) {
        return res.json({ status: "invalid_word", message: "Not in movie database" });
      }

      const evaluation = evaluateGuess(normalizedGuess, targetMovie.normalizedTitle);
      const isWin = evaluation.every((status) => status === "correct");

      const response: any = {
        status: "valid",
        evaluation,
        isWin,
      };

      if (isWin) {
        response.movieDetails = targetMovie;
      }

      res.json(response);
    } catch (error) {
      console.error("Error processing guess:", error);
      res.status(500).json({ error: "Failed to process guess" });
    }
  });

  app.post("/api/game/reveal", async (req, res) => {
    // Reveal the movie when user runs out of attempts
    try {
      const { gameId, mode, date } = req.body;
      let targetMovie;
      if (mode === "daily") {
        targetMovie = await movieService.getDailyMovie(date || new Date().toISOString().split("T")[0]);
      } else {
        const seed = gameId.replace("random-", "");
        targetMovie = movieService.getCachedRandomMovie(seed);
      }
      
      if (!targetMovie) {
        return res.status(404).json({ error: "Game not found" });
      }
      
      res.json({ movieDetails: targetMovie });
    } catch (error) {
      console.error("Error revealing movie:", error);
      res.status(500).json({ error: "Failed to reveal movie" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
