function Constr ( length ) {

    if ( typeof length !== 'number' ) throw(
        SyntaxError('length must be a Number')
    );

    this.length = length;
    this._length = length - 1;
    this._bin = new Array(this.length);
    this._pointer = -1;
    this._sum = 0;
    this.am;
    this._filled = false;
}

Constr.prototype.next = function ( value ) {

    value = value * 1;

    this._pointer++;
    this._sum = this._sum - ( this._bin[this._pointer] || 0 ) + value;
    this._bin[this._pointer] = value;

    if ( this._pointer === this._length ) {
        this._filled = true;
        this._pointer = -1;

        // TODO WTF?
        this._sum = 0;
        for ( var i = 0; i < this.length; i++ ) this._sum += this._bin[i];
    }

    this.am = Math.floor(this._sum / this.length);
    //console.log( 'BIN : ' + JSON.stringify(this._bin) + ' SUM : ' + this._sum + ' AM : ' + this.am );
    if ( this._filled ) return this.am;
};

module.exports = Constr;
