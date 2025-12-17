# Project Workflows & Architecture

This document visualizes the core workflows and architecture of the KERA AI Urban Parking application.

## 1. High-Level Architecture
This diagram shows how the Frontend connects to the Backend services.

```mermaid
graph TD
    User[User / Browser] -->|Interacts| Angular[Angular Frontend]
    Angular -->|GraphQL Queries/Mutations| GQL[GraphQL API Layer]
    subgraph "Backend Services"
        GQL -->|Auth Headers| SupabaseAuth[Supabase Auth]
        GQL -->|Resolvers| DB[(Supabase Database)]
    end
    
    style Angular fill:#dd0031,stroke:#333,stroke-width:2px
    style GQL fill:#e535ab,stroke:#333,stroke-width:2px
    style SupabaseAuth fill:#3ecf8e,stroke:#333,stroke-width:2px
    style DB fill:#3ecf8e,stroke:#333,stroke-width:2px
```

## 2. Authentication Workflow
How users enter the system and establish a session.

```mermaid
sequenceDiagram
    participant U as User
    participant C as Component (Login/Signup)
    participant S as AuthService
    participant SB as Supabase Client

    U->>C: Enter Credentials
    C->>S: signIn(email, password)
    S->>SB: auth.signInWithPassword()
    SB-->>S: Session (Token + User)
    S-->>C: Success
    C->>U: Redirect to Role-based Home
    
    note right of S: Token is cached for future GraphQL requests
```

## 3. User Booking Journey
The primary flow for a driver booking a parking spot.

```mermaid
flowchart LR
    Start(User Home) --> Search{Find Spot}
    Search -->|Select Lot| Detail[Booking Details]
    Detail -->|Click Book| Create[Create Booking Mutation]
    
    subgraph "Booking Transaction"
        Create -->|Request| API[GraphQL API]
        API -->|DB Insert| DB[(Database)]
        DB -->|Success Key| API
    end
    
    API -->|Booking ID| Payment[Payment Page]
    Payment -->|Complete| Confirmation[Passes / History]
```

## 4. Operator Workflow
The flow for parking lot managers.

```mermaid
stateDiagram-v2
    [*] --> Dashboards
    
    Dashboard --> LiveView: Monitor Occupancy
    Dashboard --> Stats: View Analytics
    Dashboard --> Profile: Manage Account
    
    LiveView --> Dashboard
    Stats --> Dashboard
```

## 5. Backend Architecture & Request Flow
The backend is a **Serverless GraphQL API** on Vercel connecting to Supabase.

### Request Lifecycle
1.  **Client** sends POST to `/graphql` via `auth.service` (with Supabase Token).
2.  **Vercel** routes to `api/src/index.ts`.
3.  **Auth Middleware** validates the token and attaches the `user` to context.
4.  **Apollo Server** matches the Schema and executes the Resolver.
5.  **Resolver** acts on Supabase DB tables (`profiles`, `parking_lots`, `bookings`).

### Booking Sequence (End-to-End)
This diagram details the logic when a booking is created, including validation.

```mermaid
sequenceDiagram
    participant User as Client App
    participant API as Apollo Server
    participant Auth as Supabase Auth
    participant DB as Supabase DB

    User->>API: Mutation createBooking(lotId, slot, duration)<br/>Auth: Bearer Token
    
    activate API
    API->>Auth: getUser(token)
    Auth-->>API: User Data (UID, Role)
    
    Note over API: Check if User is Authenticated
    
    API->>DB: SELECT * FROM parking_lots WHERE id = lotId
    DB-->>API: Lot Data (slots, price, etc.)
    
    Note over API: 1. Check if Lot exists<br/>2. Check if Slot is 'available'
    
    alt Slot Available
        API->>DB: UPDATE parking_lots (slots[id]='occupied')
        API->>DB: INSERT INTO bookings (user_id, lot_id, ...)
        DB-->>API: Return New Booking Data
        API-->>User: Booking Object (Success)
    else Slot Occupied
        API-->>User: Error: "Slot occupied"
    end
    deactivate API
```
