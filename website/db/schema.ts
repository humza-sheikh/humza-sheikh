import { sql } from "drizzle-orm";
import { sqliteTable, text, uniqueIndex, index } from "drizzle-orm/sqlite-core";
export const requests = sqliteTable("introduction_requests", {
 id:text("id").primaryKey(), mode:text("mode").notNull(), name:text("name").notNull(), email:text("email").notNull(), company:text("company").notNull(), location:text("location").notNull(), details:text("details").notNull(), createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
 timing:text("timing").notNull().default(""), source:text("source").notNull().default("direct"), campaign:text("campaign").notNull().default(""), visitId:text("visit_id"),
 stage:text("stage").notNull().default("new"), notificationState:text("notification_state").notNull().default("pending"), notificationAt:text("notification_at"), notificationId:text("notification_id")
});
export const events = sqliteTable("conversion_events", {
 id:text("id").primaryKey(), visitId:text("visit_id").notNull(), event:text("event").notNull(), placement:text("placement").notNull(), source:text("source").notNull().default("direct"), campaign:text("campaign").notNull().default(""), createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
}, table => [uniqueIndex("idx_events_visit_event_placement").on(table.visitId,table.event,table.placement),index("idx_events_created_at").on(table.createdAt)]);
