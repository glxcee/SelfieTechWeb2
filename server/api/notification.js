const db = require("./mongo");


async function setNotifications(event, config) { 
    console.log("Setting notifications for event:", config)
    const firstDate = new Date(new Date(event.start) - new Date(config.earlyTime))

    const n1 = new db.Notification({
            name: event.title + " reminder!",
            description: event.title + " scheduled for " + event.start,
            user: event.user,
            type: event.title === "Tomato" ? "tomato" : "event", // Tipo di notifica
            event: event._id, // Riferimento all'evento appena creato
            date: firstDate, // Calcola la data della notifica,
            firstNotification: firstDate,
            snoozable: config.untilSnooze, // Indica se la notifica è snoozable
         })

    await n1.save()
}

async function notificationList(user) {
    
    const timeMachine = await db.VirtualDate.findOne({ username: user.username });
    //console.log("USERNAME: ", user.username, "\nTIME MACHINE: ", timeMachine);
    const correctTime = (new Date(timeMachine.vDate)).getTime() + (Date.now() - (new Date(timeMachine.rDate)).getTime());

    console.log("Correct time for notifications:", correctTime, "\nvDate:", timeMachine.vDate, "\nrDate:", timeMachine.rDate);

    const notifications = await db.Notification.find({
        user: user.username,
        date: { $lte: new Date(correctTime) }, // Filtra le notifiche future
    }).sort({ date: -1 }); // Ordina per data crescente

    return notifications;
}

async function getNotifications(req, res) {
  const user = db.env !== "DEV" ? req.user : await db.User.findOne({username:"a"})
  notificationList(user)
    .then(notifications => {
      res.status(200).json(notifications);
    })
    .catch(err => {
      console.error("Error fetching notifications:", err);
      res.status(500).json({ message: "Error fetching notifications" });
    });
   
}

async function checkNotifications() {
    console.log("Checking notifications...");
    try {
        const users = await db.User.find({})
        for(const user of users) {

            console.log(user)

            const notifications = await notificationList(user)
            console.log(user.username + " notifications: ", notifications)

            if(notifications.length === 0) continue

            const timeMachine = await db.VirtualDate.findOne({ username: user.username });
            
            const timeElapsed = Date.now() - (new Date(timeMachine.rDate)).getTime()
            const correctTime = (new Date(new Date(timeMachine.vDate).getTime() + timeElapsed)).setSeconds(0, 0);
            const notificationTime =  (new Date(notifications[0].date)).setSeconds(0, 0);

            console.log("TIMES ", correctTime, notificationTime);

            if(correctTime === notificationTime) {
                console.log("Notification time matches current time for user:", user.username);
                
                const event = await db.Event.findById(notifications[0].event);
                const eventDate = new Date(event.start).setSeconds(0, 0);
                
                if(notificationTime.getTime() < eventDate.getTime()) {
                    let newDate = correctTime + new Date(event.repeatEvery)

                    if(eventDate.getTime() <= newDate.getTime()) {
                        console.log("Event is in the future");
                            
                        newDate = eventDate
                    }

                    const newNotification = new db.Notification({
                            name: notifications[0].name,
                            description: notifications[0].description,
                            date: newDate,
                            user: user.username,
                            type: notifications[0].type,
                            event: notifications[0].event,
                            firstNotification: notifications[0].firstNotification,
                            snoozable: notifications[0].snoozable
                    });

                    newNotification.save()
                        .then(() => {
                            console.log("New notification saved for user:", user.username);
                        })
                        .catch(err => {
                            console.error("Error saving new notification:", err);
                        });
                    }
                    
                }

                

            }
    } catch(err) {
        console.error("Error fetching users for notifications check:", err);
    }
}

module.exports = {
    get: getNotifications,
    set: setNotifications,
    check: checkNotifications
}