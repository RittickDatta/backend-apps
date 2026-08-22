# backend-apps
A collection of backend apps built with Node.js

Ideas for backend apps (with Postman API calls)
1.  Authentication and Authorization
2.  Pagination, Filtering, and Sorting
3.  Caching with Redis

Build a repo that works like a **backend engineering lab**: each project is small, runnable, documented, and deliberately demonstrates 1–3 backend concepts.

Something like:

```text
node-backend-lab/
├── 01-rest-api/
├── 02-authentication/
├── 03-authorization-rbac/
├── 04-redis-caching/
├── 05-rate-limiting/
├── 06-background-jobs/
├── 07-file-processing/
├── 08-websockets/
├── 09-transactions/
├── 10-event-driven/
└── README.md
```

That would make a very good GitHub portfolio repo.

## Projects I'd build

| Project                        | What you demonstrate                                            | Suggested tech                       |
| ------------------------------ | --------------------------------------------------------------- | ------------------------------------ |
| **1. Production REST API**     | routing, validation, errors, pagination, filtering, API design  | Express/Fastify + PostgreSQL         |
| **2. Authentication Service**  | passwords, JWT, refresh tokens, sessions, cookies               | Node + PostgreSQL                    |
| **3. RBAC API**                | authentication vs authorization, roles, permissions, middleware | Express + PostgreSQL                 |
| **4. Cached Product API**      | Redis, cache-aside, TTL, invalidation, cache misses             | Redis + PostgreSQL                   |
| **5. Rate-Limited API**        | rate limiting, Redis counters, headers, abuse protection        | Redis                                |
| **6. Background Job System**   | queues, workers, retries, exponential backoff                   | BullMQ + Redis                       |
| **7. File Processing Service** | streams, uploads, async processing, object storage              | Node Streams + S3-compatible storage |
| **8. Real-Time Notifications** | WebSockets, connections, pub/sub                                | Socket.IO / ws + Redis               |
| **9. Payment/Order API**       | DB transactions, concurrency, idempotency                       | PostgreSQL                           |
| **10. Event-Driven Services**  | events, producers/consumers, eventual consistency               | RabbitMQ/Kafka                       |

The key is that each one should answer an interview question.

For example, if someone asks **"How does caching work?"**, you can point to project 4 and discuss the actual implementation.

### 1. Production REST API

Start with something boring like:

```text
GET    /products
GET    /products/:id
POST   /products
PATCH  /products/:id
DELETE /products/:id
```

But make the engineering good.

Demonstrate:

```text
Validation
Pagination
Filtering
Sorting
Centralized error handling
HTTP status codes
Logging
Environment configuration
Graceful shutdown
API tests
```

For example:

```http
GET /products?category=laptop&sort=price&order=asc&page=2&limit=20
```

This establishes your baseline backend skills.

---

### 2. Authentication Service

Make this one specifically about **identity**.

Implement:

```text
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout
GET  /me
```

Demonstrate:

```text
password
   ↓
Argon2/bcrypt
   ↓
hashed password
   ↓
database
```

Then implement access + refresh tokens:

```text
Login
  │
  ├── access token → 15 minutes
  │
  └── refresh token → longer lived

API request
  │
  └── access token

Expired?
  │
  ↓
POST /auth/refresh
  │
  ↓
new access token
```

Include refresh-token rotation and ideally show how you would revoke sessions.

This project gives you plenty to discuss around **JWT vs sessions, cookies, CSRF, XSS, token storage and password security.**

---

### 3. Authorization / RBAC

Keep authentication separate from authorization so it's obvious you understand the distinction.

Imagine:

```text
User
Editor
Admin
```

Permissions:

```text
User
 └── article:read

Editor
 ├── article:read
 ├── article:create
 └── article:update

Admin
 ├── article:read
 ├── article:create
 ├── article:update
 └── article:delete
```

Then implement something like:

```ts
router.delete(
  "/articles/:id",
  authenticate,
  authorize("article:delete"),
  deleteArticle
);
```

You could later add **resource ownership**:

```text
Editor can edit THEIR article
Admin can edit ANY article
```

That's much more interesting than simply checking `role === "admin"`.

---

### 4. Redis Caching API

This one should be intentionally tiny.

```text
GET /products/:id
```

Without caching:

```text
Request
   ↓
Node
   ↓
PostgreSQL
   ↓
Response
```

With caching:

```text
             ┌── HIT ──→ Response
             │
Request → Redis
             │
             └── MISS
                  ↓
              PostgreSQL
                  ↓
               Redis SET
                  ↓
               Response
```

Implement the **cache-aside pattern**.

Then demonstrate the difficult part: **cache invalidation**.

```text
PATCH /products/123

PostgreSQL UPDATE
       ↓
Redis DEL product:123
```

Add metrics showing:

```text
DB request:     80ms
Cached request: 4ms
```

That makes the README much more compelling.

---

### 5. Distributed Rate Limiter

Build:

```text
GET /api/data
```

Limit:

```text
100 requests / minute / user
```

Start with an in-memory implementation and then explain why it breaks:

```text
       Load Balancer
        /        \
   Server A     Server B
   counter=8    counter=3
```

Then solve it:

```text
       Load Balancer
        /        \
   Server A     Server B
        \        /
           Redis
        counter=11
```

Demonstrate fixed-window, sliding-window or token-bucket algorithms.

This is a **small project with excellent system-design discussion value**.

---

### 6. Background Job Queue

One of the best projects in the repo.

Build an email/report service:

```http
POST /reports
```

Instead of:

```text
Request
 ↓
Generate PDF (10 sec)
 ↓
Send email
 ↓
Response
```

do:

```text
Request
   ↓
API Server
   ↓
Queue
   ↓
202 Accepted

Meanwhile...

Queue
 ↓
Worker
 ↓
Generate report
 ↓
Send notification
```

Using [BullMQ](https://bullmq.io/?utm_source=chatgpt.com) + Redis is a natural Node.js implementation.

Add:

```text
Retries
Exponential backoff
Failed jobs
Job status
Concurrency
Idempotency
```

Then intentionally make a worker fail twice before succeeding.

That's a fantastic demo.

---

### 7. Streaming File Processing

Create something like:

```http
POST /csv/import
```

Upload a **1 GB CSV** and process it without loading the entire file into memory.

Bad:

```ts
const file = await fs.readFile(...);
```

Better conceptually:

```text
File
 ↓
Readable Stream
 ↓
CSV Parser
 ↓
Transform
 ↓
Batch DB inserts
```

Demonstrate:

```text
Node streams
Backpressure
Memory efficiency
Multipart uploads
Large file handling
```

Streams are very Node-specific, so I'd definitely include this project.

---

### 8. WebSocket Notification Server

Build something tiny like live notifications.

```text
Browser
   │ WebSocket
   ↓
Node Server
   ↑
   │
POST /notifications
```

Then scale it conceptually:

```text
Client A → Server 1
             │
           Redis
           Pub/Sub
             │
Client B → Server 2
```

Demonstrate:

```text
WebSockets
Connection lifecycle
Heartbeats
Reconnects
Rooms/channels
Redis Pub/Sub
Horizontal scaling
```

---

### 9. Order API — Transactions + Concurrency

This could be one of your strongest projects.

Imagine only **one item remains**.

Two requests arrive:

```text
Customer A ───┐
              ├──→ buy product #123
Customer B ───┘
```

How do you prevent both from purchasing it?

Demonstrate:

```text
Database transactions
Isolation
Row locking
Race conditions
Optimistic/pessimistic locking
Idempotency
```

For example:

```text
BEGIN

SELECT inventory
FROM products
WHERE id = 123
FOR UPDATE

UPDATE products
SET inventory = inventory - 1

INSERT INTO orders ...

COMMIT
```

Then write a concurrency test that fires many requests simultaneously.

That's the kind of project that signals **backend engineering**, rather than simply "I know Express."

---

### 10. Event-Driven Mini System

Finally, connect a few services:

```text
Order Service
      │
      │ order.created
      ↓
 Message Broker
    /       \
   ↓         ↓
Email      Analytics
Service     Service
```

Use [RabbitMQ](https://www.rabbitmq.com/?utm_source=chatgpt.com) or [Apache Kafka](https://kafka.apache.org/?utm_source=chatgpt.com).

Demonstrate:

```text
Events
Producers
Consumers
Retries
Dead-letter queues
Eventual consistency
Idempotent consumers
```

Keep the actual business logic tiny. The architecture is what you're demonstrating.

## I'd also have a dedicated testing project

Rather than just writing unit tests everywhere, have one project whose README explicitly demonstrates your testing philosophy:

```text
Unit tests
    ↓
Service integration tests
    ↓
Database integration tests
    ↓
HTTP/API tests
```

Use Node's test runner, Vitest, or Jest plus something like Testcontainers.

A particularly impressive test would be:

```text
Test starts
   ↓
PostgreSQL Docker container starts
   ↓
Migrations run
   ↓
API starts
   ↓
Real HTTP request
   ↓
Assert database state
   ↓
Container destroyed
```

## Make the README the star of the repository

Don't just say:

> This project demonstrates Redis.

Explain the concept:

```text
04-redis-caching
│
├── Problem
│   Repeated database queries are expensive.
│
├── Solution
│   Cache-aside using Redis.
│
├── Concepts
│   • Cache hit/miss
│   • TTL
│   • Invalidation
│   • Cache stampede
│
├── Architecture
│
│   Client → API → Redis
│                   ↓ miss
│                PostgreSQL
│
├── Running
│   docker compose up
│
└── Tests
    npm test
```

That changes how the repo comes across. You're not saying **"I used Redis once."** You're saying **"Here is my understanding of caching, why you'd use it, its failure modes, and an implementation."**

### One shared stack

I'd keep most projects on roughly the same stack so you're demonstrating backend concepts rather than constantly switching frameworks:

```text
Node.js
TypeScript
Fastify or Express
PostgreSQL
Redis
Docker / Docker Compose
Zod
Vitest
```

Then introduce specialized technology only where appropriate: BullMQ for queues, RabbitMQ/Kafka for messaging, Socket.IO/ws for realtime, etc.

If I were building this specifically as a **backend interview portfolio**, the progression I'd use is:

**HTTP/API design → validation/errors → PostgreSQL → authentication → authorization → transactions/concurrency → Redis caching → rate limiting → queues → streams → WebSockets → event-driven architecture → observability/testing.**

That gives the repository a nice secondary purpose too: it becomes your own **Node.js backend reference implementation** that you can revisit before interviews.
