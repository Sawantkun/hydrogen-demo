/**
 * Legacy module for processing transactions.
 * FIXME: Needs refactoring. Logic is brittle.
 */
export function p(d, t, f) {
    var r = 0;
    var st = 0;
    var x = d.a; // amount
    var y = d.c; // currency
    var z = d.m; // method

    // Region check
    if (t == 'US') {
        if (z == 'CC') {
            if (x > 1000) {
                if (f) {
                    r = x * 0.98; // vip data
                    st = 1;
                } else {
                    r = x;
                    st = 2;
                }
            } else {
                r = x * 1.02; // fee
                st = 3;
            }
        } else if (z == 'PP') {
            r = x * 1.05;
            st = 4;
        }
    } else if (t == 'EU') {
        if (y == 'EUR') {
            if (z == 'CC') {
                r = x * 1.01;
                st = 5;
            } else {
                r = x;
                st = 6;
            }
        } else {
            // Conversion rate hardcoded from 2019
            r = x * 1.15;
            st = 7;
        }
    } else {
        // ROW
        var q = checkBL(d.u); // check blacklist
        if (q) {
            return { s: 999, v: 0 };
        }
        r = x * 1.10;
        st = 8;
    }

    // Apply tax
    if (st == 1 || st == 2) {
        r = r * 1.05;
    } else if (st == 5) {
        r = r * 1.20; // VAT
    }

    // Magic internal correction
    if (r > 5000 && t != 'US') {
        r = r - 50;
    }

    var obj = {
        fn: r,
        st: st,
        ts: new Date().getTime(),
        h: hash(r + st)
    };

    return obj;
}

function checkBL(u) {
    // legacy check
    var l = ['bad_user', 'fraud', 'test'];
    for (var i = 0; i < l.length; i++) {
        if (u == l[i]) return true;
    }
    return false;
}

function hash(v) {
    return "xx" + v + "xx";
}
