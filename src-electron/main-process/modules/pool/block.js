import { randomBytes } from "crypto"

export class Block {
  constructor(pool, template, uniform=true) {

      this.pool = pool
      this.template = template
      this.uniform = uniform
      this.seed_hash = template.seed_hash
      this.next_seed_hash = template.next_seed_hash
      this.blockhashing_blob = template.blocktemplate_blob
      this.extra_nonce = 0
      this.height = template.height
      this.difficulty = template.difficulty
      this.address = pool.config.mining.address
      this.reserved_offset = template.reserved_offset
      this.buffer = Buffer.from(template.blocktemplate_blob, "hex")
      // The clientNonceLocation is the location at which the client pools should set the nonces for each of their clients.
      this.clientNonceLocation = this.reserved_offset + 12;
      // The clientPoolLocation is for multi-thread/multi-server pools to handle the nonce for each of their tiers.
      this.clientPoolLocation = this.reserved_offset + 8;

    }
    newBlob(isProxy = false) {
        this.extra_nonce++
        if(!this.uniform) {
            this.extra_nonce = this.extra_nonce % 256
        }
        this.writeExtraNonce(this.extra_nonce)
        if (isProxy) {       
            return this.buffer.toString('hex')
        } 
        return this.convertBlob()
    }
    convertBlob() {
        try {
            return this.pool.core_bridge.convert_blob(this.buffer.toString("hex"))
        } catch(e) {
            return false
        }
    }
    writeExtraNonce(extra_nonce, buffer=false) {
        if(!buffer) {
            buffer = this.buffer
        }
        buffer.writeUInt8(extra_nonce % 256, this.template.reserved_offset)
        return buffer
    }
}
