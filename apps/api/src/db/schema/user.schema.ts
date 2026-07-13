
import {
  pgTable,     // Creates a PostgreSQL table
  varchar,     // VARCHAR data type
  pgEnum,      // Creates PostgreSQL ENUM
  uuid,        // UUID data type
  boolean,     // BOOLEAN data type
  timestamp,   // TIMESTAMP data type
} from "drizzle-orm/pg-core";


// ---------------------------------------------------------
// Create a PostgreSQL ENUM
// ---------------------------------------------------------

// This creates a database ENUM called user_role.
//
// PostgreSQL will create:
//
// CREATE TYPE user_role AS ENUM (
//   'CUSTOMER',
//   'RESTAURANT',
//   'DRIVER'
// );
//
// Instead of storing any random string,
// only these three values are allowed.

export const userRoleEnum = pgEnum("user_role", [
  "CUSTOMER",
  "RESTAURANT_OWNER",
  "DELIVERY_PERSON",
]);


// ---------------------------------------------------------
// Create Users Table
// ---------------------------------------------------------

export const usersTable = pgTable("users", {

  // ------------------------------------
  // ID
  // ------------------------------------

  // UUID Primary Key
  //
  // Database column:
  // id UUID PRIMARY KEY
  //
  // defaultRandom()
  // automatically generates UUIDs like
  //
  // e3b0c442-98fc-4d0f-9c11-95c0d8b1c123

  id: uuid("id")
    .primaryKey()
    .defaultRandom(),


  // ------------------------------------
  // First Name
  // ------------------------------------

  // Database column:
  //
  // first_name VARCHAR(255)

  firstName: varchar("first_name", {
    length: 255,
  }).notNull(),


  // ------------------------------------
  // Last Name
  // ------------------------------------

  lastName: varchar("last_name", {
    length: 255,
  }).notNull(),


  // ------------------------------------
  // Email
  // ------------------------------------

  // unique()
  //
  // No two users can have the same email.

  email: varchar("email", {
    length: 255,
  })
    .notNull()
    .unique(),


  // ------------------------------------
  // Password
  // ------------------------------------

  password: varchar("password", {
    length: 255,
  }).notNull(),


  // ------------------------------------
  // User Role
  // ------------------------------------

  // Uses the ENUM created above.
  //
  // Allowed values:
  //
  // CUSTOMER
  // RESTAURANT_OWNER
  // DELIVERY_PERSON
  //
  // Default:
  // CUSTOMER

  role: userRoleEnum()
    .notNull()
    .default("CUSTOMER"),


  // ------------------------------------
  // Push Notification Token
  // ------------------------------------

  // Used by mobile apps
  //
  // Firebase Cloud Messaging Token
  //
  // Example:
  //
  // dKJH87sdf78SDf...

  pushToken: varchar("push_token", {
    length: 255,
  }),


  // ------------------------------------
  // Online Status
  // ------------------------------------

  // true
  // false
  //
  // Default:
  // false

  isOnline: boolean("is_online")
    .default(false),


  // ------------------------------------
  // Created At
  // ------------------------------------

  // Automatically stores
  // current date and time.

  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow(),


  // ------------------------------------
  // Updated At
  // ------------------------------------

  // Initially stores current time.
  //
  // Usually updated manually whenever
  // the record changes.

  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow(),

});


// ---------------------------------------------------------
// TypeScript Types
// ---------------------------------------------------------

// Represents data coming FROM the database.
//
// Example:
//
// const user = await db.select().from(usersTable);
//
// user will have this type.

export type User = typeof usersTable.$inferSelect;


// Represents data inserted INTO the database.
//
// Example:
//
// db.insert(usersTable).values(...)

export type NewUser = typeof usersTable.$inferInsert;