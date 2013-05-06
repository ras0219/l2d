function isOp(ch) {
    return ch === '+' ||
        ch === '-' ||
        ch === '*' ||
        ch === '/';
}

function isAlpha(ch) {
    var co = ch.charCodeAt(0);
    
    return (co > 64 && co < 91) ||
        (co > 96 && co < 123) ||
        ch == '_';
}

function isDigit(ch) {
    var co = ch.charCodeAt(0);
    return co > 47 && co < 58;
}

function tokenize(eqn) {
    var tokens = [];
    var curtok = "";
    var curtype = 'none';

    function clear() {
        if (curtype === 'number')
            tokens.push(parseInt(curtok));
        else if (curtype === 'letter')
            tokens.push(curtok);
        curtok = '';
        curtype = 'none';
    }

    function settype(t) {
        if (curtype !== t) {
            clear();
            curtype = t;
        }
    }

    for (var x = 0; x < eqn.length; ++x) {
        var ch = eqn.charAt(x);
        if(isAlpha(ch)) {
            // character is a letter
            settype('letter');
            curtok += ch;
        } else if(isDigit(ch)) {
            settype('number');
            curtok += ch;
        } else if(ch === ' ') {
            // end current token
            clear();
        } else if(ch === '(' ||
                  ch === ')' ||
                  isOp(ch)) {
            // push all symbol characters
            clear();
            tokens.push(ch);
        } else {
            // Invalid character
        }
    }
    clear();
    return tokens;
}

function parse(ts) {
    ts.unshift(null);

    function prim() {
        var t = ts[ts.length-1];
        if (typeof t === 'number' || isAlpha(t)) {
            ts.pop();
            return t;
        }
        if (t === ')') {
            ts.pop();
            var n = expr();
            if (ts[ts.length-1] !== '(')
                throw "expected open paren";
            ts.pop();
            return n;
        }
        throw "could not parse primary";
    }

    function term() {
        var rhs = prim();
        var t = ts[ts.length-1];
        if (t === '*' || t === '/') {
            ts.pop();
            var lhs = term();
            return { op: t, r: rhs, l: lhs };
        }
        return rhs;
    }

    function expr() {
        var rhs = term();
        var t = ts[ts.length-1];
        if (t === '+' || t === '-') {
            ts.pop();
            var lhs = expr();
            return { op: t, r: rhs, l: lhs };
        }
        return rhs;
    }

    var e = expr();
    if (ts.length > 1)
        throw "Expected end of input.";
    
    return e;
}


function findVars(ast) {
    var vset = {};
    var index = 0;
    (function recurse(ast) {
        if (typeof ast === 'number')
            return;
        if (typeof ast === 'string') {
            if (ast in vset)
                return;
            vset[ast] = { type: 'number',
                          index: index };
            index++;
            return;
        }
        recurse(ast.l);
        recurse(ast.r);
    })(ast);
    return vset;
}

function eval(a, v, r) {
    if (typeof a === 'number')
        return a;
    if (typeof a === 'string')
        return r[v[a].index];
    if (a.op === '+')
        return eval(a.l,v,r) + eval(a.r,v,r);
    if (a.op === '-')
        return eval(a.l,v,r) - eval(a.r,v,r);
    if (a.op === '*')
        return eval(a.l,v,r) * eval(a.r,v,r);
    if (a.op === '/')
        return eval(a.l,v,r) / eval(a.r,v,r);
}

var ts = tokenize("100 / (100 + armor * (1 - pct_pen))");
//console.log(JSON.stringify(ts, null, 2));
var p = parse(ts);
//console.log(JSON.stringify(p, null, 2));
var v = findVars(p);
console.log(JSON.stringify(v, null, 2));

console.log(JSON.stringify(eval(p, v, [50, 0.40]), null, 2));
