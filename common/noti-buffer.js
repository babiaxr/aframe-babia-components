/*
 * Notifying buffer
 *
 * This buffer maintains an object (data). Its value is set with 'set',
 *  and when set, it triggers notications to registered consumers
 *  Registration is done via 'register'.
 */
class NotiBuffer {
    /*
     * notifiers: object with registered notifier objects
     *  - key: identifier (unique integer)
     *  - value: notify function
     */
    constructor(func1, func2) {
        this.currentId = 0;
        this.notifiers = {};
        this.data;
        // Optional: Function to be executed by producer
        // if details are received when registering
        this.function1 = func1; 
        // Optional: Function to be executed by producer
        // if details are received when unregistering
        this.function2 = func2;
    }

    /*
     * Set data in the buffer
     */
    set(data) {
        console.log("produced", data);
        this.data = data;
        for (const notify of Object.values(this.notifiers)) {
            notify(this.data);
        }
    }

    /*
     * Register a notifier for the buffer
     *  Notifiers have the following signature:
     *  function notifier (data)
     *  data is the data stored in the buffer
     *  Returns the id of the notifier
     */
    register(notify, details) {
        if (this.data !== undefined) {
            console.log("Data was ready");
            notify(this.data);
        };
        let id = this.currentId;
        this.notifiers[id] = notify;
        this.currentId ++;

        // Optional: Details from consumer and function to be executed by producer
        if (details && this.function1) {
            this.function1(details);
        }
        return id;
    }

    /*
     * Unregister a notifier for the buffer
     *  id is the the identifier returned when registering
     */
    unregister(id, details) {
        delete(this.notifiers[id]);

        // Optional: Details from consumer and function to be executed by producer
        if (details && this.function2) {
            this.function2(details);
        }
    }
}

// Export (only if 'module' exists, that is, we're not in the browser)
if (typeof module !== 'undefined') {
    module.exports.NotiBuffer = NotiBuffer;
};