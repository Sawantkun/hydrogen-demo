import { json } from '@shopify/remix-oxygen';
import { useLoaderData } from '@remix-run/react';

export async function loader({ context }) {
    return json({
        products: await context.storefront.query(`#graphql
      query {
        products(first: 10) {
          nodes {
            id
            title
            handle
          }
        }
      }
    `),
    });
}

export default function MessyExample() {
    const { products } = useLoaderData();

    var user_data = {
        name: "John",
        age: 30,
        role: "admin",
        active: true,
        created_at: "2023-01-01"
    };

    // very long function that does too much
    function processUserData(u) {
        if (u) {
            if (u.active == true) {
                var d = new Date(u.created_at);
                var date_str = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
                console.log("User is active since " + date_str);

                if (u.role == "admin") {
                    console.log("User is admin");
                    // duplicate logic
                    var d2 = new Date();
                    var current_date_str = d2.getDate() + "/" + (d2.getMonth() + 1) + "/" + d2.getFullYear();
                    console.log("Current date: " + current_date_str);
                } else {
                    console.log("User is not admin");
                    // duplicate logic again
                    var d3 = new Date();
                    var current_date_str2 = d3.getDate() + "/" + (d3.getMonth() + 1) + "/" + d3.getFullYear();
                    console.log("Current date: " + current_date_str2);
                }
            }
        }
    }

    processUserData(user_data);

    return (
        <div style={{ padding: "20px", fontFamily: "Arial" }}>
            <h1 style={{ color: "red", fontSize: "24px" }}>Messy Example Page</h1>
            <div className="user-info">
                <h3>User Info</h3>
                <p>Name: {user_data.name}</p>
                <p>Role: {user_data.role}</p>
            </div>

            <div className="product-list">
                <h3>Products</h3>
                <ul>
                    {products.products.nodes.map((p) => {
                        // inline function in render
                        var price = 100; // hardcoded
                        var tax = price * 0.2;
                        var total = price + tax;

                        return (
                            <li key={p.id} style={{ marginBottom: "10px", borderBottom: "1px solid #ccc" }}>
                                <b>{p.title}</b> - Price: ${total}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
