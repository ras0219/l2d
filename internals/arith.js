function isOp(ch) {
    return "+-*/><=^&|~".indexOf(ch) > -1;
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

    function parseLevel(lowerTerm, opset) {
        function parse_closure() {
            var rhs = lowerTerm();
            var t = ts[ts.length-1];
            if (opset.indexOf(t) > -1) {
                ts.pop();
                var lhs = parse_closure();
                return { op: t, r: rhs, l: lhs };
            }
            return rhs;
        }
        return parse_closure;
    }

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

    term = parseLevel(prim, "*/%");
    expr = parseLevel(term, "+-");
    relation = parseLevel(expr, "><=");
    bool_rel = parseLevel(relation, "~");
    and_logic = parseLevel(bool_rel, "&");
    xor_logic = parseLevel(and_logic, "^");
    or_logic = parseLevel(xor_logic, "|");

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

function check(ast) {
    function merge(t1, t2) {
        if (t1 === 'variable' && t2 === 'variable')
            return 'number';
        if (t1 === 'variable')
            return t2;
        if (t2 === 'variable')
            return t1;
        if (t1 !== t2)
            throw "Typing failed.";
        return t1;
    }

    var vset = {};
    var index = 0;

    var rtype = (function recurse(ast, exp) {
        if (typeof ast === 'number')
            return merge('number', exp);
        if (typeof ast === 'string') {
            if (ast in vset)
                return merge(vset[ast].type, exp);
            vset[ast] = { type: merge('variable', exp),
                          index: index };
            index++;
            return vset[ast].type;
        }
        var optype;
        if ("+-*/=><".indexOf(ast.op) > -1)
            optype = 'number';
        else if ("&|^~".indexOf(ast.op) > -1)
            optype = 'bool';
        else
            throw "Unknown operator";
        recurse(ast.l, optype);
        recurse(ast.r, optype);

        if ("+-*/".indexOf(ast.op) > -1)
            return merge('number', exp);
        else if ("=><&|^~".indexOf(ast.op) > -1)
            return merge('bool', exp);
    })(ast, 'variable');

    return { rtype: rtype,
             vset: vset };
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
    if (a.op === '%')
        return eval(a.l,v,r) % eval(a.r,v,r);
    if (a.op === '=')
        return eval(a.l,v,r) == eval(a.r,v,r);
    if (a.op === '>')
        return eval(a.l,v,r) > eval(a.r,v,r);
    if (a.op === '<')
        return eval(a.l,v,r) < eval(a.r,v,r);
    if (a.op === '~')
        return eval(a.l,v,r) == eval(a.r,v,r);
    if (a.op === '&')
        return eval(a.l,v,r) && eval(a.r,v,r);
    if (a.op === '|')
        return eval(a.l,v,r) || eval(a.r,v,r);
    if (a.op === '^')
        return eval(a.l,v,r) ? eval(a.r,v,r) : !eval(a.r,v,r);
}

// var ts = tokenize("100 / (100 + armor * (1 - pct_pen))");
// //console.log(JSON.stringify(ts, null, 2));
// var p = parse(ts);
// //console.log(JSON.stringify(p, null, 2));
// var v = findVars(p);
// console.log(JSON.stringify(v, null, 2));

// console.log(JSON.stringify(eval(p, v, [50, 0.40]), null, 2));

exports.tokenize = tokenize;
exports.parse = parse;
exports.findVars = findVars;
exports.eval = eval;
