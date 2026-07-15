CREATE TYPE "notification_type" AS ENUM('order', 'promotion', 'offer', 'payment', 'system');--> statement-breakpoint
CREATE TYPE "order_status" AS ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'PICKED_UP', 'DELIVERED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "payment_method" AS ENUM('ONLINE', 'OFFLINE');--> statement-breakpoint
CREATE TYPE "payment_status" AS ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "user_role" AS ENUM('CUSTOMER', 'RESTAURANT_OWNER', 'DRIVER', 'ADMIN');--> statement-breakpoint
CREATE TABLE "favorite_restaurants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "favorite_restaurants_user_restaurant_unique" UNIQUE("user_id","restaurant_id")
);
--> statement-breakpoint
CREATE TABLE "menu_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(100) NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(255) NOT NULL,
	"description" text,
	"price" numeric(10,2) NOT NULL,
	"category_id" uuid NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"image_url" text,
	"is_available" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"order_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"quantity" numeric NOT NULL,
	"unit_price" numeric(10,2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"item_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"driver_id" uuid NOT NULL,
	"total_amount" numeric(10,2) NOT NULL,
	"delivery_address" text NOT NULL,
	"payment_id" text,
	"payment_method" "payment_method" DEFAULT 'OFFLINE'::"payment_method" NOT NULL,
	"order_status" "order_status" DEFAULT 'PENDING'::"order_status" NOT NULL,
	"payment_status" "payment_status" DEFAULT 'PENDING'::"payment_status" NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "restaurants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"owner_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL UNIQUE,
	"description" text,
	"logo_url" text,
	"cover_image_url" text,
	"phone" varchar(20),
	"email" varchar(255),
	"address_line" text NOT NULL,
	"city" varchar(100) NOT NULL,
	"country" varchar(100) NOT NULL,
	"postal_code" varchar(20),
	"latitude" double precision,
	"longitude" double precision,
	"cuisine_type" varchar(100) NOT NULL,
	"opening_time" time,
	"closing_time" time,
	"average_rating" real DEFAULT 0 NOT NULL,
	"total_reviews" integer DEFAULT 0 NOT NULL,
	"delivery_fee" numeric(10,2) DEFAULT '0.00' NOT NULL,
	"minimum_order_amount" numeric(10,2) DEFAULT '0.00' NOT NULL,
	"estimated_delivery_time" integer,
	"is_open" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"item_id" uuid,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_user_restaurant_unique" UNIQUE("user_id","restaurant_id")
);
--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"full_address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"country" text NOT NULL,
	"postal_code" text,
	"latitude" double precision,
	"longitude" double precision,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL UNIQUE,
	"password" varchar(255) NOT NULL,
	"phone" varchar(20),
	"role" "user_role" DEFAULT 'CUSTOMER'::"user_role" NOT NULL,
	"image_url" text,
	"push_token" text,
	"is_online" boolean DEFAULT false NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "favorite_restaurants" ADD CONSTRAINT "favorite_restaurants_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "favorite_restaurants" ADD CONSTRAINT "favorite_restaurants_restaurant_id_restaurants_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "menu_categories" ADD CONSTRAINT "menu_categories_restaurant_id_restaurants_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_category_id_menu_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "menu_categories"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_restaurant_id_restaurants_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_id_orders_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_item_id_menu_items_id_fkey" FOREIGN KEY ("item_id") REFERENCES "menu_items"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_item_id_menu_items_id_fkey" FOREIGN KEY ("item_id") REFERENCES "menu_items"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_users_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_driver_id_users_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_restaurant_id_restaurants_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id");--> statement-breakpoint
ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_owner_id_users_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_restaurant_id_restaurants_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_item_id_menu_items_id_fkey" FOREIGN KEY ("item_id") REFERENCES "menu_items"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;