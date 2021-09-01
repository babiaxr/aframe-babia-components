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
    constructor() {
        this.currentId = 0;
        this.notifiers = {};
        this.data;
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
    register(notify) {
        if (this.data !== undefined) {
            console.log("Data was ready");
            notify(this.data);
        };
        let id = this.currentId;
        this.notifiers[id] = notify;
        this.currentId ++;
        return id;
    }

    /*
     * Unregister a notifier for the buffer
     *  id is the the identifier returned when registering
     */
    unregister(id) {
        delete(this.notifiers[id]);
    }
}

// Export (only if 'module' exists, that is, we're not in the browser)
if (typeof module !== 'undefined') {
    module.exports.NotiBuffer = NotiBuffer;
};