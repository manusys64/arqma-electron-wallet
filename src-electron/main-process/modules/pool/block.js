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
      this.clientNonceLocation = this.reserveOffset + 12;
      // The clientPoolLocation is for multi-thread/multi-server pools to handle the nonce for each of their tiers.
      this.clientPoolLocation = this.reserveOffset + 8;

        if(uniform) {
            /* Uniform mode
             *   when enabled, we will mimic normal pool
             *   set extra_nonce to random number between 0-31
             *   also set "instanceID" to random four bytes
             */
            this.extra_nonce = randomBytes(1).readUInt8() % 32
            randomBytes(4).copy(this.buffer, template.reserved_offset + 4)
        }
    }
    newBlob(isProxy = false) {
        this.extra_nonce++

        if (isProxy) {
            this.extra_nonce = this.extra_nonce % 256
            buffer.writeUInt32BE(extra_nonce, this.template.reserved_offset)
            return this.buffer.toString('hex')
        } else {
            if(!this.uniform) {
                this.extra_nonce = this.extra_nonce % 256
            }
            this.writeExtraNonce(this.extra_nonce)
            return this.convertBlob()
        }
    }
    convertBlob(isProxy = false) {
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
        if(this.uniform) {
            buffer.writeUInt32BE(extra_nonce, this.template.reserved_offset)
        } else {
            buffer.writeUInt8(extra_nonce % 256, this.template.reserved_offset)
        }
        return buffer
    }
}
