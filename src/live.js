/** Live Page
 * 
 * handles live messages
 * converts incoming and outgoing messages to events like `otree.live.type`
 */
 export class Live {
  constructor(page) {
    this.page = page;
    this.init();
  }
    
  init() {
    window.liveRecv = this.recv.bind(this);
  }

  recv(data) {
    // console.debug("recv", data);
    const type = data.type;
    delete data.type;
    this.page.fire(`otree.live.${type}`, data);
  }

  /** send a message
   * 
   * @param type {String} message type
   * @param message {Object} message payload
   */
  send(type, message) {
    const data = Object.assign({ type }, message);
    // console.debug("send", data);
    window.liveSend(data);
    this.page.fire(`otree.live.${type}`, message);
  }
}
