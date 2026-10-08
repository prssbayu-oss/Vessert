import earcut from './lib/earcut.js';  // ← import fungsi mentah

class Earcut {

  static triangulate( data, holeIndices, dim = 2 ) {
    return earcut( data, holeIndices, dim );  // ← delegasi satu baris
  }

}

export { Earcut };
