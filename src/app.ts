import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import globalErrorHandler from "./middleware/globalErrorHandler";
import logger from "./middleware/logger";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes";
const app: Application = express();

app.use(express.json());
app.use(cookieParser());
app.use(logger);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello");
});

app.use("/api/auth", authRoutes);

app.use(globalErrorHandler);

app.use((req, res, next) => {
  res.status(404).json("what??😠");
});

export default app;
