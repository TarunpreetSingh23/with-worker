import connectDB from "@/lib/mongodb";
import Task from "@/models/Task";
import { NextResponse } from "next/server";
// 🔑 IMPORT THE NOTIFICATION FUNCTION
import { sendTaskNotification } from "@/lib/notifications"; 


// You might need a function that specifically notifies the client/manager.
// For simplicity, let's assume sendTaskNotification can be repurposed or you create a new one:
// import { sendWorkerResponseNotification } from "@/lib/notifications"; 

export async function PATCH(req, { params }) {
    // 🔑 Placeholder for the ID of the entity to notify (e.g., the client who created the task)
    let userToNotifyId = null;

    try {
        await connectDB();
        const { id } = params;
        const { action } = await req.json(); // action = "accept" or "reject"

        let update = {};
        let notificationBody = "";



        if (action === "accept") {
            update = { status: "Accepted", is_approved: true };
            notificationBody = "The worker has accepted your assigned task and will proceed soon.";
        } else if (action === "reject") {
            update = { status: "Rejected", is_approved: false };
            notificationBody = "The worker has rejected your assigned task. Please reassign.";
        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        // 1. Find the task first to get the worker ID and client ID (if available)
        const originalTask = await Task.findById(id);
        if (!originalTask) {
             return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        // 🔑 Assuming your Task model has a 'clientId' or 'managerId' field to notify:
        userToNotifyId = originalTask.clientId; // Adjust field name as necessary
        const workerName = originalTask.name; // Assuming 'name' is available for better context

        // 2. Update the task status
        const updatedTask = await Task.findByIdAndUpdate(id, update, { new: true });

        if (!updatedTask) {
            return NextResponse.json({ error: "Task not found after update" }, { status: 404 });
        }

        // 3. Send Notification to the User/Client
        if (userToNotifyId) {
             const success = await sendTaskNotification(
                 userToNotifyId, // The ID of the client/manager to be notified
                 updatedTask._id,
                 `${updatedTask.name} (${action}ed): ${notificationBody}`
             );
             console.log(`Notification sent to client ${userToNotifyId}: ${success}`);
        }

        return NextResponse.json(updatedTask, { status: 200 });
    } catch (err) {
        console.error("Error updating task or sending notification:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}