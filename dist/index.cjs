

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/app.ts
var import_express3 = __toESM(require("express"), 1);

// src/config/index.ts
var import_dotenv = __toESM(require("dotenv"), 1);
var import_process = require("process");
import_dotenv.default.config({ quiet: true });
var config = {
  port: import_process.env.PORT,
  database_url: import_process.env.DATABASE_URL,
  node_env: import_process.env.NODE_ENV,
  secret: import_process.env.JWT_SECRET,
  refresh_secret: import_process.env.JWT_REFRESH_SECRET
};

// src/middleware/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err instanceof Error ? err.message : "Internal Server Error",
    stack: config.node_env === "development" && err instanceof Error ? err.stack : void 0
  });
};
var globalErrorHandler_default = globalErrorHandler;

// src/middleware/logger.ts
var import_colors = require("kleur/colors");
var logger = (req, res, next) => {
  console.log(
    `[${(0, import_colors.green)((/* @__PURE__ */ new Date()).toLocaleString())}]`,
    (0, import_colors.italic)(req.method),
    (0, import_colors.blue)(req.url)
  );
  next();
};
var logger_default = logger;

// src/app.ts
var import_cookie_parser = __toESM(require("cookie-parser"), 1);

// src/modules/auth/auth.routes.ts
var import_express = require("express");

// src/modules/auth/auth.service.ts
var import_bcrypt = __toESM(require("bcrypt"), 1);

// src/db/index.ts
var import_serverless = require("@neondatabase/serverless");

// src/db/schema.ts
var createUserSchema = async () => {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'contributor',
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;
};
var createIssueSchema = async () => {
  await sql`
    CREATE TABLE IF NOT EXISTS issues (
      id SERIAL PRIMARY KEY,
      title VARCHAR(150) NOT NULL,
      description text  NOT NULL CHECK (char_length(description)>=20),
      type VARCHAR(20) NOT NULL CHECK (type IN ('bug', 'feature_request')),
      status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
      reporter_id INT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;
};

// src/db/index.ts
var sql = (0, import_serverless.neon)(config.database_url);
var initDB = async () => {
  await createUserSchema();
  await createIssueSchema();
  console.log("Database connected successfully!");
};

// src/modules/auth/auth.service.ts
var AuthService = class {
  async hashPassword(password) {
    const hash = await import_bcrypt.default.hash(password, 10);
    return hash;
  }
  async comparePassword(password, hash) {
    return await import_bcrypt.default.compare(password, hash);
  }
  async createUser(user) {
    const { name, email, password, role } = user;
    const passwordHash = await this.hashPassword(password);
    const result = await sql`
    INSERT INTO users (name, email, password_hash, role) 
    VALUES (${name}, ${email}, ${passwordHash}, COALESCE(${role}, 'contributor'))
    RETURNING id, name, email, role, created_at, updated_at
    `;
    return result[0];
  }
  async validateUser(email, password) {
    const result = await sql`
      SELECT id, name, email, password_hash, role, created_at, updated_at
      FROM users
      WHERE email = ${email}
    `;
    if (!result.length) {
      return null;
    }
    const { password_hash, ...user } = result[0];
    const isValid = await this.comparePassword(password, password_hash);
    return isValid ? user : null;
  }
  async getUsers(ids) {
    const result = await sql`
      SELECT id, name, email, role
      FROM users
      WHERE id = ANY(${ids})
    `;
    return result;
  }
  async getUserById(userId) {
    const result = await sql`
      SELECT id, name, email, role
      FROM users
      WHERE id = ${userId}
    `;
    return result[0];
  }
  async updateUser(userId, updates) {
    const { name, email, role, password } = updates;
    let passwordHash;
    if (password) {
      passwordHash = await this.hashPassword(password);
    }
    const result = await sql`
      UPDATE users
      SET
        name = COALESCE(${name}, name),
        email = COALESCE(${email}, email),
        role = COALESCE(${role}, role),
        password_hash = COALESCE(${passwordHash}, password_hash),
        updated_at = NOW()
      WHERE id = ${userId}
      RETURNING id, name, email, role, created_at, updated_at
    `;
    return result[0];
  }
  async deleteUser(userId) {
    try {
      await sql`
        DELETE FROM users
        WHERE id = ${userId}
      `;
      return true;
    } catch {
      return false;
    }
  }
};
var auth_service_default = new AuthService();

// src/utils/jwt.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var verifyToken = (token, type) => {
  const secret = type === "refresh" ? config.refresh_secret : config.secret;
  const decoded = import_jsonwebtoken.default.verify(token, secret);
  return decoded;
};
var signToken = (payload) => {
  const accessToken = import_jsonwebtoken.default.sign(payload, config.secret, {
    expiresIn: "7d"
  });
  const refreshToken = import_jsonwebtoken.default.sign(payload, config.refresh_secret, {
    expiresIn: "30d"
  });
  return { accessToken, refreshToken };
};

// src/utils/sendResponse.ts
function sendResponse(res, { message, data, error }, status = 200) {
  res.status(status).json({
    success: error ? false : true,
    message,
    data: error ? void 0 : data
  });
}

// src/middleware/auth.ts
var auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return sendResponse(
        res,
        { message: "Access token is missing", error: true },
        401
      );
    }
    const tokenWithoutBearer = token.split(" ")[1];
    const payload = verifyToken(tokenWithoutBearer, "refresh");
    if (!payload) {
      return sendResponse(
        res,
        { message: "Invalid access token", error: true },
        401
      );
    }
    const user = await auth_service_default.getUserById(payload.id);
    if (!user) {
      return sendResponse(res, { message: "User not found", error: true }, 404);
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// src/modules/auth/auth.controller.ts
var signup = async (req, res) => {
  const { name, email, password, role } = req.body;
  const user = await auth_service_default.createUser({ name, email, password, role });
  if (!user) {
    return sendResponse(
      res,
      { message: "Failed to create user", error: true },
      400
    );
  }
  sendResponse(
    res,
    { message: "User registered successfully", data: user },
    200
  );
};
var login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await auth_service_default.validateUser(email, password);
    if (!user) {
      return sendResponse(
        res,
        { message: "Invalid email or password", error: true },
        401
      );
    }
    const { accessToken, refreshToken } = signToken(user);
    res.cookie("refreshToken", refreshToken, {
      secure: false,
      httpOnly: true,
      sameSite: "lax"
    });
    const result = {
      accessToken,
      refreshToken,
      user
    };
    sendResponse(res, { message: "User login successfully!", data: result });
  } catch (error) {
    console.error(error);
  }
};
var logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return sendResponse(
      res,
      { message: "No active session found", error: true },
      400
    );
  }
  res.clearCookie("refreshToken", {
    secure: false,
    httpOnly: true,
    sameSite: "lax"
  });
  sendResponse(res, { message: "Logged out successfully" }, 200);
};
var refresh = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return sendResponse(
      res,
      { message: "Refresh token not provided", error: true },
      401
    );
  }
  const payload = verifyToken(refreshToken, "refresh");
  if (!payload) {
    return sendResponse(
      res,
      { message: "Invalid or expired refresh token", error: true },
      403
    );
  }
  const user = await auth_service_default.getUserById(payload.id);
  if (!user) {
    return sendResponse(res, { message: "User not found", error: true }, 404);
  }
  const { accessToken, refreshToken: newRefreshToken } = signToken(user);
  res.cookie("refreshToken", newRefreshToken, {
    secure: false,
    httpOnly: true,
    sameSite: "lax"
  });
  sendResponse(
    res,
    { message: "Token refreshed successfully", data: { accessToken } },
    200
  );
};
var getCurrentUser = async (req, res) => {
  const accessToken = req.headers.authorization;
  if (!accessToken) {
    return sendResponse(res, { message: "Unauthorized", error: true }, 401);
  }
  const userId = verifyToken(accessToken, "access")?.id;
  const user = await auth_service_default.getUserById(userId);
  if (!user) {
    return sendResponse(res, { message: "User not found", error: true }, 404);
  }
  sendResponse(res, { message: "User fetched successfully", data: user }, 200);
};
var updateUser = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return sendResponse(res, { message: "Unauthorized", error: true }, 401);
  }
  const { name, email, password } = req.body;
  const updated = await auth_service_default.updateUser(userId, {
    name,
    email,
    password
  });
  if (!updated) {
    return sendResponse(
      res,
      { message: "Failed to update user", error: true },
      400
    );
  }
  sendResponse(
    res,
    { message: "User updated successfully", data: updated },
    200
  );
};
var deleteAccount = async (req, res) => {
  const id = req.user?.id;
  if (!id) {
    return sendResponse(res, { message: "Unauthorized", error: true }, 401);
  }
  const deleted = await auth_service_default.deleteUser(id);
  if (!deleted) {
    return sendResponse(
      res,
      { message: "Failed to delete account", error: true },
      400
    );
  }
  res.clearCookie("refreshToken", {
    secure: false,
    httpOnly: true,
    sameSite: "lax"
  });
  sendResponse(res, { message: "Account deleted successfully" }, 200);
};

// src/modules/auth/auth.routes.ts
var router = (0, import_express.Router)();
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/refresh", refresh);
router.get("/me", getCurrentUser);
router.put("/update/:id", auth, updateUser);
router.delete("/delete/:id", auth, deleteAccount);
var auth_routes_default = router;

// src/modules/issues/issue.routes.ts
var import_express2 = require("express");

// src/modules/issues/issue.service.ts
var IssueService = class {
  async createIssue(issue, user) {
    const reporter_id = user.id;
    const { title, description, type } = issue;
    const result = await sql`
    INSERT INTO issues (title, description, type, reporter_id)
    VALUES (${title}, ${description}, ${type}, ${reporter_id})
    RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
    
    `;
    return result[0];
  }
  async formattedObjectIssue(allIssue, users) {
    const result = allIssue.map((issue) => {
      const reporter = users.find((user) => user.id === issue.reporter_id);
      const formatted = {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        status: issue.status,
        reporter: reporter ? {
          id: reporter.id,
          name: reporter.name,
          role: reporter.role
        } : null,
        created_at: issue.created_at,
        updated_at: issue.updated_at
      };
      return formatted;
    });
    return result;
  }
  buildFilters(filters) {
    const conditions = [];
    if (filters.type) {
      conditions.push(`type = '${filters.type}'`);
    }
    if (filters.status) {
      conditions.push(`status = '${filters.status}'`);
    }
    if (conditions.length === 0) {
      return "";
    }
    return `WHERE ${conditions.join(" AND ")}`;
  }
  buildSort(sort) {
    if (sort === "oldest") {
      return `ORDER BY created_at ASC`;
    }
    return `ORDER BY created_at DESC`;
  }
  async formattedData(allIssue, users) {
    return this.formattedObjectIssue(allIssue, users);
  }
  async getAllIssueService(filters = {}) {
    const whereClause = this.buildFilters(filters);
    const orderClause = this.buildSort(filters.sort);
    const query = `
    SELECT *
    FROM issues
    ${whereClause}
    ${orderClause}
  `;
    const result = await sql.query(query);
    return result;
  }
  async getSingleIssueService(issueId) {
    const result = await sql`
    SELECT * FROM issues WHERE id=${issueId}
    `;
    return result;
  }
  async updateIssueService(issueId, updates) {
    const { title, description, type } = updates;
    const result = await sql`
      UPDATE issues
      SET
        title = COALESCE(${title}, title),
        description = COALESCE(${description}, description),
        type = COALESCE(${type}, type),
        updated_at = NOW()
      WHERE id = ${issueId}
      RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
    `;
    return result[0];
  }
  async deleteIssue(issueId) {
    try {
      await sql`
        DELETE FROM issues
        WHERE id = ${issueId}
      `;
      return true;
    } catch {
      return false;
    }
  }
};
var issue_service_default = new IssueService();

// src/modules/issues/issue.controller.ts
var createIssueController = async (req, res) => {
  try {
    const issue = await issue_service_default.createIssue(req.body, req.user);
    if (!issue) {
      return sendResponse(
        res,
        { message: "Failed to create issue", error: true },
        400
      );
    }
    sendResponse(
      res,
      { message: "Issue registered successfully", data: issue },
      200
    );
  } catch (error) {
    console.error(error);
  }
};
var getAllIssueController = async (req, res) => {
  try {
    const { sort, type, status } = req.query;
    const allIssue = await issue_service_default.getAllIssueService({
      sort,
      type,
      status
    });
    if (allIssue.length === 0) {
      return sendResponse(res, { message: "No issue found", data: [] }, 200);
    }
    const reporterIds = [
      ...new Set(allIssue.map((issue) => issue.reporter_id))
    ];
    const users = await auth_service_default.getUsers(reporterIds);
    const formattedIssue = await issue_service_default.formattedData(allIssue, users);
    sendResponse(
      res,
      { message: "Issue get successfully", data: formattedIssue },
      200
    );
  } catch (error) {
    console.error(error);
  }
};
var getSingleIssueController = async (req, res) => {
  try {
    const { id } = req.params;
    if (typeof id !== "string") {
      return;
    }
    const singleIssue = await issue_service_default.getSingleIssueService(
      id
    );
    if (singleIssue.length === 0) {
      return sendResponse(res, { message: "No issue found", data: [] }, 200);
    }
    const reporterIds = [
      ...new Set(singleIssue.map((issue2) => issue2.reporter_id))
    ];
    const users = await auth_service_default.getUsers(reporterIds);
    const formattedIssue = await issue_service_default.formattedData(singleIssue, users);
    const issue = formattedIssue[0];
    if (!issue) return null;
    sendResponse(res, { message: "Issue get successfully", data: issue }, 200);
  } catch (error) {
    console.error(error);
  }
};
var updateIssueController = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      sendResponse(
        res,
        {
          message: "Issue id not found",
          error: true
        },
        400
      );
    }
    if (typeof id !== "string") {
      return;
    }
    const { title, description, type } = req.body;
    const user = req.user;
    if (!user) {
      return sendResponse(
        res,
        {
          message: "Unauthorized",
          error: true
        },
        401
      );
    }
    const existingIssue = await issue_service_default.getSingleIssueService(id);
    const issue = existingIssue[0];
    if (!issue) {
      return sendResponse(
        res,
        {
          message: "Issue not found",
          error: true
        },
        404
      );
    }
    const isOwner = issue.reporter_id === user.id;
    const isMaintainer = user.role === "maintainer";
    if (!isOwner && !isMaintainer) {
      return sendResponse(
        res,
        {
          message: "Forbidden",
          error: true
        },
        403
      );
    }
    const updated = await issue_service_default.updateIssueService(id, {
      title,
      description,
      type
    });
    if (!updated) {
      return sendResponse(
        res,
        { message: "Failed to update issue", error: true },
        400
      );
    }
    sendResponse(
      res,
      { message: "User updated successfully", data: updated },
      200
    );
  } catch (error) {
    console.error(error);
  }
};
var deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return sendResponse(
        res,
        {
          message: "Issue id not found",
          error: true
        },
        400
      );
    }
    if (typeof id !== "string") {
      return;
    }
    const user = req.user;
    if (!user) {
      return sendResponse(
        res,
        {
          message: "Unauthorized",
          error: true
        },
        401
      );
    }
    if (user.role !== "maintainer") {
      return sendResponse(
        res,
        {
          message: "Forbidden",
          error: true
        },
        403
      );
    }
    const existingIssue = await issue_service_default.getSingleIssueService(id);
    const issue = existingIssue[0];
    if (!issue) {
      sendResponse(
        res,
        {
          message: "Issue not found",
          error: true
        },
        404
      );
    }
    const deleted = await issue_service_default.deleteIssue(id);
    if (!deleted) {
      return sendResponse(
        res,
        { message: "Failed to delete issue", error: true },
        400
      );
    }
    sendResponse(res, { message: "Issue deleted successfully" }, 200);
  } catch (error) {
    console.error(error);
    return sendResponse(
      res,
      {
        message: "Internal server error",
        error: true
      },
      500
    );
  }
};

// src/modules/issues/issue.routes.ts
var router2 = (0, import_express2.Router)();
router2.post("/", auth, createIssueController);
router2.get("/", getAllIssueController);
router2.get("/:id", getSingleIssueController);
router2.patch("/:id", auth, updateIssueController);
router2.delete("/:id", auth, deleteIssue);
var issue_routes_default = router2;

// src/app.ts
var app = (0, import_express3.default)();
app.use(import_express3.default.json());
app.use((0, import_cookie_parser.default)());
app.use(logger_default);
app.get("/", (req, res) => {
  res.send("Hello");
});
app.use("/api/auth", auth_routes_default);
app.use("/api/issues", issue_routes_default);
app.use(globalErrorHandler_default);
app.use((req, res, next) => {
  res.status(404).json("what??\u{1F620}");
});
var app_default = app;

// src/index.ts
var main = async () => {
  await initDB();
  app_default.listen(config.port, () => {
    console.log(`Server listening on port ${config.port}`);
  });
};
main();
//# sourceMappingURL=index.cjs.map