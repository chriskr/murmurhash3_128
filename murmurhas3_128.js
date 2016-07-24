'use strict';

/*
  https://github.com/aappleby/smhasher/blob/master/src/MurmurHash3.cpp
  translated to JS.
  Public domain.
*/

class MurmurHash3_128 {
  static hash(input, seed = 0xc3d2e1f0) {
    console.assert(
        typeof input === 'string' || input instanceof Uint8Array,
        'input must be of type string or a Uint8Array');
    const data = typeof input === 'string' ?
        new TextEncoder('utf-16').encode(input) :
        input;
    const length = data.length;
    const blockCounts = length >> 4;
    const tailLength = length - blockCounts << 4;
    const dataUint32 = new Uint32Array(data.buffer, 0, blockCounts * 4);

    let h1 = seed;
    let h2 = seed;
    let h3 = seed;
    let h4 = seed;

    const c1 = 0x239b961b;
    const c2 = 0xab0e9789;
    const c3 = 0x38b34ae5;
    const c4 = 0xa1e38b93;

    //----------
    // body

    for (let i = 0; i < blockCounts; i++) {
      let index = i * 4;
      let k1 = dataUint32[index++];
      let k2 = dataUint32[index++];
      let k3 = dataUint32[index++];
      let k4 = dataUint32[index++];

      k1 = this.multiply32(k1, c1);
      k1 = this.rotateLeft32(k1, 15);
      k1 = this.multiply32(k1, c2);
      h1 ^= k1;
      h1 = this.rotateLeft32(h1, 19);
      h1 = (h1 + h2) | 0;
      h1 = (h1 * 5 + 0x561ccd1b) | 0;

      k2 = this.multiply32(k2, c2);
      k2 = this.rotateLeft32(k2, 16);
      k2 = this.multiply32(k2, c3);
      h2 ^= k2;
      h2 = this.rotateLeft32(h2, 17);
      h2 = (h2 + h3) | 0;
      h2 = (h2 * 5 + 0x0bcaa747) | 0;

      k3 = this.multiply32(k3, c3);
      k3 = this.rotateLeft32(k3, 17);
      k3 = this.multiply32(k3, c4);
      h3 ^= k3;
      h3 = this.rotateLeft32(h3, 15);
      h3 = (h3 + h4) | 0;
      h3 = (h3 * 5 + 0x96cd1c35) | 0;

      k4 = this.multiply32(k4, c4);
      k4 = this.rotateLeft32(k4, 18);
      k4 = this.multiply32(k4, c1);
      h4 ^= k4;
      h4 = this.rotateLeft32(h4, 13);
      h4 = (h4 + h1) | 0;
      h4 = (h4 * 5 + 0x32ac3b17) | 0;
    }

    //----------
    // tail

    const tail = new Uint8Array(
        data.buffer, blockCounts * 16, length - blockCounts * 16);

    let k1 = 0;
    let k2 = 0;
    let k3 = 0;
    let k4 = 0;

    switch (length & 15) {
      case 15:
        k4 ^= tail[14] << 16;
      case 14:
        k4 ^= tail[13] << 8;
      case 13:
        k4 ^= tail[12] << 0;
        k4 = this.multiply32(k4, c4);
        k4 = this.rotateLeft32(k4, 18);
        k4 = this.multiply32(k4, c1);
        h4 ^= k4;

      case 12:
        k3 ^= tail[11] << 24;
      case 11:
        k3 ^= tail[10] << 16;
      case 10:
        k3 ^= tail[9] << 8;
      case 9:
        k3 ^= tail[8] << 0;
        k3 = this.multiply32(k3, c3);
        k3 = this.rotateLeft32(k3, 17);
        k3 = this.multiply32(k3, c4);
        h3 ^= k3;

      case 8:
        k2 ^= tail[7] << 24;
      case 7:
        k2 ^= tail[6] << 16;
      case 6:
        k2 ^= tail[5] << 8;
      case 5:
        k2 ^= tail[4] << 0;
        k2 = this.multiply32(k2, c2);
        k2 = this.rotateLeft32(k2, 16);
        k2 = this.multiply32(k2, c3);
        h2 ^= k2;

      case 4:
        k1 ^= tail[3] << 24;
      case 3:
        k1 ^= tail[2] << 16;
      case 2:
        k1 ^= tail[1] << 8;
      case 1:
        k1 ^= tail[0] << 0;
        k1 = this.multiply32(k1, c1);
        k1 = this.rotateLeft32(k1, 15);
        k1 = this.multiply32(k1, c2);
        h1 ^= k1;
    }

    //----------
    // finalization

    h1 ^= length;
    h2 ^= length;
    h3 ^= length;
    h4 ^= length;

    h1 = (h1 + h2) | 0;
    h1 = (h1 + h3) | 0;
    h1 = (h1 + h4) | 0;
    h2 = (h2 + h1) | 0;
    h3 = (h3 + h1) | 0;
    h4 = (h4 + h1) | 0;

    h1 = this.finalMix32(h1);
    h2 = this.finalMix32(h2);
    h3 = this.finalMix32(h3);
    h4 = this.finalMix32(h4);

    h1 = (h1 + h2) | 0;
    h1 = (h1 + h3) | 0;
    h1 = (h1 + h4) | 0;
    h2 = (h2 + h1) | 0;
    h3 = (h3 + h1) | 0;
    h4 = (h4 + h1) | 0;

    return this.toHex8(h1) + this.toHex8(h2) + this.toHex8(h3) +
        this.toHex8(h4);
  }

  static multiply32(a, b) {
    a |= 0;
    b |= 0;
    return (a * b & 0xffff0000) | (a * (b & 0xffff) & 0xffff);
  }

  static rotateLeft32(a, b) { return (a << b) | (a >>> (32 - b)); }

  static finalMix32(h) {
    h ^= h >>> 16;
    h = this.multiply32(h, 0x85ebca6b);
    h ^= h >>> 13;
    h = this.multiply32(h, 0xc2b2ae35);
    h ^= h >>> 16;
    return h | 0;
  }

  static toHex8(a) { return `00000000${(a >>> 0).toString(16)}`.slice(-8); }
}
