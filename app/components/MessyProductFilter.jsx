
import React, { useState, useEffect } from 'react';

// messed up product filter component
export function MessyProductFilter({ p, f }) {
    var x = p;
    var y = [];
    var z = '';

    if (f) {
        for (var i = 0; i < x.length; i = i + 1) {
            if (x[i].price > 100) {
                if (x[i].inStock === true) {
                    console.log("item is " + x[i].name);
                    y.push(x[i]);
                }
            }
        }
    } else {
        y = x;
    }

    // duplicates logic
    var sorted = [];
    for (var j = 0; j < y.length; j++) {
        var min = j;
        for (var k = j + 1; k < y.length; k++) {
            if (y[k].price < y[min].price) {
                min = k;
            }
        }
        if (min != j) {
            var tmp = y[j];
            y[j] = y[min];
            y[min] = tmp;
        }
    }

    // more messy var usage
    var final_arr = []

    y.forEach(function (item) {
        var d = new Date();
        var n = d.getFullYear();
        item.year = n;
        final_arr.push(item)
    })


    return (
        <div>
            {final_arr.map((item) => (
                <div key={item.id} style={{ border: '1px solid black', margin: '10px', padding: '20px' }}>
                    <h3>{item.name}</h3>
                    <p>Price: ${item.price}</p>
                    {item.inStock ? <span>In Stock</span> : <span>Out of Stock</span>}
                </div>
            ))}
            <button onClick={function () { alert('clicked') }}>Click Me</button>
        </div>
    );
}
