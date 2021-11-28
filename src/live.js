/** Live Page
 * 
 * Convertings incoming and outgoing messages into events with type `otree.live.sometype`
 *   
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

  /** 
   * Sends a message
   * 
   * @param type {String} message type
   * @param message {Object} message payload
   * @fires Live.message
   */
  send(type, message) {
    const data = Object.assign({ type }, message);
    // console.debug("send", data);
    window.liveSend(data);
    this.page.fire(`otree.live.${type}`, message);
  }
}

/**
 * Live message.
 * 
 * Either received or sent.
 * 
 * @event Live.message
 * @property type {string} `otree.live.*` -- corresponding to message type  
 * @property detail {object} any message payload 
 */