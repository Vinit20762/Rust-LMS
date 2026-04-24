/* ================================================================
   Module 3: Structs, Enums & Data Modeling
   Chapters: 12 - 17
   ================================================================ */
Object.assign(CHAPTERS_CONTENT, {

  /* ---------------------------------------------------------------
     Chapter 12: Structs & Methods
     --------------------------------------------------------------- */
  'ch12': {
    moduleNum: 3,
    moduleTitle: 'Structs, Enums & Data Modeling',
    chNum: 12,
    title: 'Structs & Methods',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 3 &mdash; Chapter 12</span>
</div>

<h1>Structs &amp; Methods</h1>

<p>In real programs, data rarely comes in isolated pieces. A user has a name, an email address, and an age. A rectangle has a width and a height. A game character has hit points, a position, and a level. When you need to group several related values together under one meaningful name, you use a <strong>struct</strong>.</p>

<p>A struct is one of the most important tools in Rust. It is how you create your own custom data types, and it is the foundation for everything more complex that follows in this module.</p>

<h2>The Patient Record Analogy</h2>

<p>Think of a struct like a form at a doctor's office. The blank form has labeled fields: "Patient Name:", "Date of Birth:", "Weight:". That blank template is the struct definition. Each time a new patient checks in, staff fill out a fresh copy. That filled-out form is a struct instance.</p>

<p>Every filled-out form has exactly the same fields as the template, but with different values inside. You could have a thousand patient forms, all sharing the same structure, each holding its own distinct data.</p>

<h2>Defining a Struct</h2>

<p>You define a struct with the <code>struct</code> keyword, a name in PascalCase (every word capitalized), and a list of fields inside curly braces. Each field has a name and a type, separated by a colon:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">struct Rectangle {
    width: u32,
    height: u32,
}</code></pre>
</div>

<p>This defines a new type called <code>Rectangle</code>. Right now this is just the blank template. No actual rectangle data has been created yet.</p>

<div class="callout">
  <div class="callout-label">Naming Convention</div>
  <p>Struct names use <strong>PascalCase</strong>: capitalize the first letter of every word (Rectangle, PlayerCharacter, HttpRequest). Field names use <strong>snake_case</strong> like regular variables (first_name, hit_points). The compiler will warn you if you deviate from these conventions.</p>
</div>

<h2>Creating an Instance</h2>

<p>To create an instance of a struct (fill out the form), write the struct name followed by curly braces containing each field name and its value:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let rect = Rectangle {
        width: 30,
        height: 50,
    };

    println!("Width: {}", rect.width);
    println!("Height: {}", rect.height);
}</code></pre>
</div>

<pre class="output"><code>Width: 30
Height: 50</code></pre>

<p>You access a field using dot notation: <code>rect.width</code> reads the value stored in the <code>width</code> field. This should feel familiar if you have used objects in other languages, though Rust structs are simpler and more explicit.</p>

<h2>Mutable Structs</h2>

<p>Just like regular variables, struct instances are immutable by default. If you want to change any field after creation, declare the entire instance with <code>mut</code>. In Rust, mutability is all-or-nothing at the instance level: either the whole struct is mutable, or none of it is.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let mut rect = Rectangle {
        width: 30,
        height: 50,
    };

    println!("Before: {}x{}", rect.width, rect.height);
    rect.width = 60;
    println!("After: {}x{}", rect.width, rect.height);
}</code></pre>
</div>

<pre class="output"><code>Before: 30x50
After: 60x50</code></pre>

<h2>Struct Update Syntax</h2>

<p>Sometimes you want to create a new struct instance that is mostly the same as an existing one, but with one or two fields changed. Instead of listing every field manually, Rust provides a concise shorthand called the struct update syntax using <code>..</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let original = Rectangle { width: 30, height: 50 };

    // Create a new rectangle with the same height but different width
    let wider = Rectangle {
        width: 100,
        ..original    // fill remaining fields from original
    };

    println!("Original: {}x{}", original.width, original.height);
    println!("Wider:    {}x{}", wider.width, wider.height);
}</code></pre>
</div>

<pre class="output"><code>Original: 30x50
Wider:    100x50</code></pre>

<p>The <code>..original</code> syntax means "copy all remaining fields from <code>original</code>". Fields you list explicitly (like <code>width: 100</code>) take priority and override the copied values.</p>

<h2>Printing a Struct for Debugging</h2>

<p>If you try <code>println!("{}", rect)</code> on a struct, Rust refuses to compile: it does not know how to convert your custom type into a string. The fastest solution is to add <code>#[derive(Debug)]</code> directly above your struct definition. This instructs Rust to automatically generate debug-printing code for you:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let rect = Rectangle { width: 30, height: 50 };
    println!("{:?}", rect);   // compact form
    println!("{:#?}", rect);  // pretty-printed form
}</code></pre>
</div>

<pre class="output"><code>Rectangle { width: 30, height: 50 }
Rectangle {
    width: 30,
    height: 50,
}</code></pre>

<p>The <code>{:?}</code> format uses the <strong>Debug</strong> trait. The <code>{:#?}</code> version adds indentation, which is more readable for structs with many fields. You will use these two constantly while developing.</p>

<h2>Methods</h2>

<p>Fields store data. But a struct can also have <strong>behavior</strong> attached to it through methods. A method is a function tied to a specific struct. It always receives the struct instance as its first parameter, which is called <code>self</code>.</p>

<p>Think of it this way: a rectangle does not just have a width and height. It can also compute its area, its perimeter, and whether it is a square. These operations belong to the rectangle concept itself, and defining them as methods keeps that logic together with the data it operates on.</p>

<p>Methods live inside an <code>impl</code> block (short for "implementation"):</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn area(&amp;self) -&gt; u32 {
        self.width * self.height
    }
}

fn main() {
    let rect = Rectangle { width: 30, height: 50 };
    println!("Area: {}", rect.area());
}</code></pre>
</div>

<pre class="output"><code>Area: 1500</code></pre>

<p>Let's unpack the <code>fn area(&amp;self) -&gt; u32</code> signature:</p>

<dl>
  <dt><code>&amp;self</code></dt>
  <dd>A reference to the struct instance the method is called on. The <code>&amp;</code> means "borrow this struct for reading only." We look at the data but do not modify it and do not take ownership. Think of it as: "lend me the rectangle so I can read it."</dd>
  <dt><code>-&gt; u32</code></dt>
  <dd>The return type. This method computes and returns a number.</dd>
</dl>

<p>Inside the method, <code>self.width</code> and <code>self.height</code> access the fields of the specific instance the method was called on. When you write <code>rect.area()</code>, Rust automatically passes <code>rect</code> as the <code>self</code> argument.</p>

<h2>Mutating Methods with &amp;mut self</h2>

<p>Sometimes a method needs to change the struct's own data. Use <code>&amp;mut self</code> for this. The instance must also be declared with <code>mut</code> at the call site:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn area(&amp;self) -&gt; u32 {
        self.width * self.height
    }

    fn scale(&amp;mut self, factor: u32) {
        self.width *= factor;
        self.height *= factor;
    }
}

fn main() {
    let mut rect = Rectangle { width: 10, height: 20 };
    println!("Before: {:?}, area = {}", rect, rect.area());

    rect.scale(3);
    println!("After:  {:?}, area = {}", rect, rect.area());
}</code></pre>
</div>

<pre class="output"><code>Before: Rectangle { width: 10, height: 20 }, area = 200
After:  Rectangle { width: 30, height: 60 }, area = 1800</code></pre>

<h2>Methods with Additional Parameters</h2>

<p>Methods can take any number of parameters beyond <code>self</code>. Here is a complete example that shows all three kinds of methods together:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn area(&amp;self) -&gt; u32 {
        self.width * self.height
    }

    fn perimeter(&amp;self) -&gt; u32 {
        2 * (self.width + self.height)
    }

    fn is_square(&amp;self) -&gt; bool {
        self.width == self.height
    }

    // Takes a reference to another Rectangle as a parameter
    fn can_contain(&amp;self, other: &amp;Rectangle) -&gt; bool {
        self.width &gt; other.width &amp;&amp; self.height &gt; other.height
    }
}

fn main() {
    let big   = Rectangle { width: 50, height: 40 };
    let small = Rectangle { width: 20, height: 30 };
    let sq    = Rectangle { width: 25, height: 25 };

    println!("Area of big:            {}", big.area());
    println!("Perimeter of big:       {}", big.perimeter());
    println!("Is big a square?        {}", big.is_square());
    println!("Is sq a square?         {}", sq.is_square());
    println!("Can big contain small?  {}", big.can_contain(&amp;small));
}</code></pre>
</div>

<pre class="output"><code>Area of big:            2000
Perimeter of big:       180
Is big a square?        false
Is sq a square?         true
Can big contain small?  true</code></pre>

<p>The <code>can_contain</code> method takes a second parameter: <code>other: &amp;Rectangle</code>. We borrow the other rectangle the same way we borrow <code>self</code>, so neither rectangle is moved or consumed.</p>

<div class="callout">
  <div class="callout-label">Multiple impl Blocks</div>
  <p>You are allowed to split a struct's methods across multiple <code>impl</code> blocks. Both blocks apply to the same type. This is useful for keeping logically distinct groups of methods organized, and it becomes especially important when you learn about traits in Module 7.</p>
</div>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Modifying a Field on an Immutable Instance</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN
struct Point { x: i32, y: i32 }

fn main() {
    let p = Point { x: 0, y: 0 };
    p.x = 10; // error: cannot assign to field of immutable variable
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: declare the binding with mut
fn main() {
    let mut p = Point { x: 0, y: 0 };
    p.x = 10; // OK
}</code></pre>
</div>

<h3>Mistake 2: Calling a Mutating Method on an Immutable Instance</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN
fn main() {
    let rect = Rectangle { width: 10, height: 20 };
    rect.scale(2); // error: cannot borrow as mutable
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: the instance must be mut if any method takes &amp;mut self
fn main() {
    let mut rect = Rectangle { width: 10, height: 20 };
    rect.scale(2); // OK
}</code></pre>
</div>

<h3>Mistake 3: Forgetting to Initialize All Fields</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN
struct Rectangle { width: u32, height: u32 }

fn main() {
    let rect = Rectangle { width: 30 }; // error: missing field 'height'
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: provide every field
fn main() {
    let rect = Rectangle { width: 30, height: 50 }; // OK
}</code></pre>
</div>

<div class="callout">
  <div class="callout-label">Unlike C or Go</div>
  <p>Rust does not provide automatic zero-values for struct fields. Every field must be explicitly given a value when you create an instance. This prevents bugs caused by accidentally using uninitialized data.</p>
</div>
`
  },


  /* ---------------------------------------------------------------
     Chapter 13: Associated Functions
     --------------------------------------------------------------- */
  'ch13': {
    moduleNum: 3,
    moduleTitle: 'Structs, Enums & Data Modeling',
    chNum: 13,
    title: 'Associated Functions',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 3 &mdash; Chapter 13</span>
</div>

<h1>Associated Functions</h1>

<p>In the previous chapter you learned about methods: functions inside an <code>impl</code> block that take <code>self</code>, <code>&amp;self</code>, or <code>&amp;mut self</code> as their first parameter, and operate on an existing struct instance.</p>

<p>There is a second kind of function that lives inside an <code>impl</code> block: the <strong>associated function</strong>. It does not take <code>self</code> at all. It is not called on an instance. Instead, it is called on the type itself, using the double-colon <code>::</code> syntax. You have already used one without knowing it: <code>String::new()</code> creates a new empty <code>String</code>.</p>

<h2>The Factory Department Analogy</h2>

<p>Picture a car manufacturer. Workers on the assembly line operate on cars that already exist: painting them, installing seats, testing brakes. Those workers are like methods. They act on an existing instance.</p>

<p>But there is also a design and fabrication department that does not work on existing cars. Their job is to build brand-new cars from a specification sheet. They are not "called on a car" because the car does not exist yet. That is the role of associated functions: they produce a new instance of the type (or compute something related to it) without needing an existing instance to start from.</p>

<h2>Defining an Associated Function</h2>

<p>An associated function looks exactly like a method except the first parameter is not <code>self</code>, <code>&amp;self</code>, or <code>&amp;mut self</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    // Associated function: no self parameter
    fn new(width: u32, height: u32) -&gt; Rectangle {
        Rectangle { width, height }
    }

    // Method: has &amp;self
    fn area(&amp;self) -&gt; u32 {
        self.width * self.height
    }
}

fn main() {
    // Call with :: (not dot notation)
    let rect = Rectangle::new(30, 50);
    println!("{:?}", rect);
    println!("Area: {}", rect.area());
}</code></pre>
</div>

<pre class="output"><code>Rectangle { width: 30, height: 50 }
Area: 1500</code></pre>

<p>Two things to notice in the <code>new</code> function body:</p>

<dl>
  <dt>Field shorthand</dt>
  <dd>When a parameter name matches a field name exactly (both are <code>width</code>, both are <code>height</code>), you can write just <code>width</code> instead of <code>width: width</code>. This is the same field init shorthand you can use when creating any struct literal.</dd>
  <dt>Return type</dt>
  <dd>The function returns <code>Rectangle</code>, the same type it belongs to. This is the standard pattern for constructor-style associated functions.</dd>
</dl>

<h2>The new() Convention</h2>

<p>Rust does not have built-in constructors the way Java or C++ do. There is no <code>new</code> keyword with special meaning. Instead, the entire community follows a strong convention: if a type has a primary way to be created, wrap that creation in an associated function named <code>new</code>.</p>

<p>You will see this pattern everywhere in the Rust standard library:</p>

<ul>
  <li><code>String::new()</code> creates an empty string</li>
  <li><code>Vec::new()</code> creates an empty vector</li>
  <li><code>HashMap::new()</code> creates an empty hash map</li>
</ul>

<p>When you see <code>TypeName::new(...)</code>, you immediately know: "this creates a fresh instance of TypeName." It is a powerful convention that makes code self-documenting without any extra language machinery.</p>

<h2>Multiple Constructors</h2>

<p>A struct can have multiple associated functions that each create an instance in a different way. Unlike languages with constructor overloading, Rust gives each one a distinct, descriptive name:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    // Primary constructor: explicit width and height
    fn new(width: u32, height: u32) -&gt; Rectangle {
        Rectangle { width, height }
    }

    // Convenience constructor: create a square from one side length
    fn square(size: u32) -&gt; Rectangle {
        Rectangle { width: size, height: size }
    }

    fn area(&amp;self) -&gt; u32 {
        self.width * self.height
    }
}

fn main() {
    let r1 = Rectangle::new(30, 50);
    let r2 = Rectangle::square(25);

    println!("r1: {:?}, area = {}", r1, r1.area());
    println!("r2: {:?}, area = {}", r2, r2.area());
}</code></pre>
</div>

<pre class="output"><code>r1: Rectangle { width: 30, height: 50 }, area = 1500
r2: Rectangle { width: 25, height: 25 }, area = 625</code></pre>

<p><code>Rectangle::square(25)</code> is far more readable than <code>Rectangle::new(25, 25)</code>. The name <code>square</code> communicates intent: you want a square, not just a rectangle where the two values happen to be equal.</p>

<h2>Returning Self</h2>

<p>Inside an <code>impl</code> block, the keyword <code>Self</code> (capital S) is an alias for the type the block is implementing. Using <code>Self</code> in the return type is a common style because it makes code resilient to renaming: if you rename your struct, you only need to update the <code>struct</code> line, not every associated function's return type:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">impl Rectangle {
    fn new(width: u32, height: u32) -&gt; Self {   // Self = Rectangle
        Self { width, height }                   // Self here too
    }

    fn square(size: u32) -&gt; Self {
        Self { width: size, height: size }
    }
}</code></pre>
</div>

<p>Both <code>Rectangle</code> and <code>Self</code> compile to identical code. The Rust community commonly uses <code>Self</code> in constructor-style functions.</p>

<h2>The :: vs . Distinction</h2>

<p>This difference is worth drilling in clearly, because it trips up many beginners:</p>

<dl>
  <dt>Dot notation: <code>rect.area()</code></dt>
  <dd>Calls a method on an existing instance. Rust automatically passes the instance as the <code>self</code> argument. Used for any function that has <code>self</code>, <code>&amp;self</code>, or <code>&amp;mut self</code> as its first parameter.</dd>
  <dt>Double-colon notation: <code>Rectangle::new(30, 50)</code></dt>
  <dd>Calls an associated function on the type itself. No instance is involved at all. Used for functions that have no <code>self</code> parameter.</dd>
</dl>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    // :: calls an associated function on the TYPE
    let rect = Rectangle::new(30, 50);

    // . calls a method on the INSTANCE
    let a = rect.area();
    println!("area = {}", a);

    // This would NOT compile:
    // let rect2 = rect.new(10, 20); // error: no method named 'new'
}</code></pre>
</div>

<h2>Associated Functions That Are Not Constructors</h2>

<p>Not every associated function creates an instance. Some compute a value related to the type, or act as utility functions. Here is an example that computes the maximum possible area given a fixed perimeter:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">impl Rectangle {
    fn new(width: u32, height: u32) -&gt; Self {
        Self { width, height }
    }

    // Not a constructor: returns a number, not a Rectangle
    fn max_area_for_perimeter(perimeter: u32) -&gt; u32 {
        // A square gives the maximum area for a fixed perimeter
        let side = perimeter / 4;
        side * side
    }

    fn area(&amp;self) -&gt; u32 {
        self.width * self.height
    }
}

fn main() {
    let max = Rectangle::max_area_for_perimeter(40);
    println!("Max area for perimeter 40: {}", max); // 100 (10x10 square)
}</code></pre>
</div>

<pre class="output"><code>Max area for perimeter 40: 100</code></pre>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Using Dot Notation to Call an Associated Function</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN
fn main() {
    let rect = Rectangle { width: 10, height: 20 };
    let rect2 = rect.new(30, 40); // error: no method named 'new' found
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: use :: to call associated functions
fn main() {
    let rect2 = Rectangle::new(30, 40);
}</code></pre>
</div>

<h3>Mistake 2: Accidentally Adding &amp;self to a Constructor</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: intended as a constructor, but has &amp;self
impl Rectangle {
    fn new(&amp;self, width: u32, height: u32) -&gt; Rectangle {
        Rectangle { width, height } // self is never used — strange!
    }
}

// Now you need an existing Rectangle just to create another one:
fn main() {
    let dummy = Rectangle { width: 0, height: 0 };
    let r = dummy.new(30, 50); // awkward and misleading
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: remove &amp;self to make it a true associated function
impl Rectangle {
    fn new(width: u32, height: u32) -&gt; Rectangle {
        Rectangle { width, height }
    }
}

fn main() {
    let r = Rectangle::new(30, 50); // clean and clear
}</code></pre>
</div>

<h3>Mistake 3: Omitting the Type Name When Calling a Constructor</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN
fn main() {
    let rect = new(30, 50); // error: cannot find function 'new' in scope
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: always prefix with the type name
fn main() {
    let rect = Rectangle::new(30, 50);
}</code></pre>
</div>
`
  },


  /* ---------------------------------------------------------------
     Chapter 14: Enums & Option
     --------------------------------------------------------------- */
  'ch14': {
    moduleNum: 3,
    moduleTitle: 'Structs, Enums & Data Modeling',
    chNum: 14,
    title: 'Enums & Option',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 3 &mdash; Chapter 14</span>
</div>

<h1>Enums &amp; Option</h1>

<p>A struct is great when something always has all its parts: every rectangle has a width and a height, every user has a name and an email. But what about things that can be in one of several completely different states? A traffic light is either Red, Yellow, or Green. A network message is either a login request, a chat message, or a disconnect. These are not things that "have all their parts at once." They are one thing at a time from a fixed set of possibilities.</p>

<p>For this kind of data, Rust gives you <strong>enums</strong> (short for enumerations).</p>

<h2>The Labeled Box Analogy</h2>

<p>Imagine a row of labeled boxes on a shelf: "Red", "Yellow", "Green". At any moment, a small flag sits inside exactly one of these boxes. You can look at which box holds the flag to know the current state. The boxes themselves never change. Only which one holds the flag can change.</p>

<p>An enum is that row of labeled boxes. Each box is a <strong>variant</strong>. At any point in time, a value of that enum type is sitting in exactly one variant.</p>

<h2>Defining and Using a Basic Enum</h2>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">enum Direction {
    North,
    South,
    East,
    West,
}

fn main() {
    let heading = Direction::North;

    match heading {
        Direction::North => println!("Going North"),
        Direction::South => println!("Going South"),
        Direction::East  => println!("Going East"),
        Direction::West  => println!("Going West"),
    }
}</code></pre>
</div>

<pre class="output"><code>Going North</code></pre>

<p>A few things to notice:</p>

<ul>
  <li>Enum names use PascalCase (Direction), just like struct names.</li>
  <li>Variant names also use PascalCase (North, South).</li>
  <li>To create a value, you write <code>EnumName::VariantName</code>.</li>
  <li>The <code>match</code> expression is the primary way to use enum values. You will learn much more about match in Chapter 15.</li>
</ul>

<h2>Enums with Data</h2>

<p>Basic enums just name states. But often each variant needs to carry different data. Rust enums can hold data, and each variant can hold a different kind and amount of data.</p>

<p>Think of it like a post office: each package type (Letter, Parcel, Express) needs different paperwork. A Letter needs just an address. A Parcel needs an address and a weight. An Express needs an address, weight, and a tracking number. An enum can model exactly this:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">enum Message {
    Quit,                          // no data
    Move { x: i32, y: i32 },      // named fields (like a struct)
    Write(String),                 // one value (like a tuple)
    ChangeColor(u8, u8, u8),       // three values (red, green, blue)
}

fn process(msg: Message) {
    match msg {
        Message::Quit => {
            println!("Quitting!");
        }
        Message::Move { x, y } => {
            println!("Moving to ({}, {})", x, y);
        }
        Message::Write(text) => {
            println!("Writing: {}", text);
        }
        Message::ChangeColor(r, g, b) => {
            println!("Color: rgb({}, {}, {})", r, g, b);
        }
    }
}

fn main() {
    process(Message::Move { x: 10, y: 20 });
    process(Message::Write(String::from("hello")));
    process(Message::ChangeColor(255, 128, 0));
    process(Message::Quit);
}</code></pre>
</div>

<pre class="output"><code>Moving to (10, 20)
Writing: hello
Color: rgb(255, 128, 0)
Quitting!</code></pre>

<p>Each variant is completely independent. <code>Message::Quit</code> carries no data. <code>Message::Move</code> carries named fields <code>x</code> and <code>y</code>. <code>Message::Write</code> carries a single <code>String</code>. This is one of the most powerful features of Rust enums: each variant can have its own shape.</p>

<div class="callout">
  <div class="callout-label">Enums Condense Many Structs</div>
  <p>In many other languages, you would need four separate structs (or classes) to represent these four kinds of messages. In Rust, a single enum captures all four possibilities in one cohesive type. Code that accepts a <code>Message</code> knows it must handle all four cases.</p>
</div>

<h2>Methods on Enums</h2>

<p>Just like structs, enums can have methods defined in an <code>impl</code> block:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">enum Direction {
    North,
    South,
    East,
    West,
}

impl Direction {
    fn is_horizontal(&amp;self) -&gt; bool {
        match self {
            Direction::East | Direction::West =&gt; true,
            _ =&gt; false,
        }
    }
}

fn main() {
    let d = Direction::East;
    println!("Is horizontal? {}", d.is_horizontal()); // true
    let d2 = Direction::North;
    println!("Is horizontal? {}", d2.is_horizontal()); // false
}</code></pre>
</div>

<pre class="output"><code>Is horizontal? true
Is horizontal? false</code></pre>

<h2>The Option Type: Handling Absence Safely</h2>

<p>One of the most common problems in programming is dealing with the absence of a value. In many languages, this is handled by a special <code>null</code> or <code>nil</code> value. The inventor of <code>null</code>, Tony Hoare, later called it his "billion dollar mistake" because null references cause crashes in countless programs every year.</p>

<p>Rust eliminates null entirely. Instead, when a value might or might not exist, Rust uses the <strong><code>Option&lt;T&gt;</code></strong> enum. It is defined in the standard library like this:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// This is already defined in Rust's standard library.
// You do not need to write this yourself.
enum Option&lt;T&gt; {
    Some(T),  // a value of type T exists
    None,     // no value exists
}</code></pre>
</div>

<p>The <code>T</code> is a placeholder that means "any type". <code>Option&lt;i32&gt;</code> means "either <code>Some(i32)</code> (an integer exists) or <code>None</code> (no integer)". <code>Option&lt;String&gt;</code> means "either <code>Some(String)</code> or <code>None</code>".</p>

<h2>Creating Option Values</h2>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let some_number: Option&lt;i32&gt; = Some(42);
    let no_number: Option&lt;i32&gt; = None;

    println!("{:?}", some_number); // Some(42)
    println!("{:?}", no_number);   // None
}</code></pre>
</div>

<pre class="output"><code>Some(42)
None</code></pre>

<p>Because <code>Option&lt;T&gt;</code> is so commonly used, Rust brings <code>Some</code> and <code>None</code> into scope automatically. You do not need to write <code>Option::Some(42)</code>, you can write just <code>Some(42)</code>.</p>

<h2>Using Option: A Real Example</h2>

<p>Here is a function that searches a list of numbers and returns the first one that is even. If no even number exists, it returns <code>None</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn first_even(numbers: &amp;[i32]) -&gt; Option&lt;i32&gt; {
    for &amp;n in numbers {
        if n % 2 == 0 {
            return Some(n);
        }
    }
    None
}

fn main() {
    let with_even    = vec![1, 3, 5, 8, 11];
    let without_even = vec![1, 3, 5, 7, 9];

    match first_even(&amp;with_even) {
        Some(n) => println!("Found even: {}", n),
        None    => println!("No even numbers found"),
    }

    match first_even(&amp;without_even) {
        Some(n) => println!("Found even: {}", n),
        None    => println!("No even numbers found"),
    }
}</code></pre>
</div>

<pre class="output"><code>Found even: 8
No even numbers found</code></pre>

<p>The caller is forced to handle both cases. There is no way to accidentally use the result as if it were always a number. This is the core of what makes Rust programs reliable: the type system makes the possibility of absence explicit and checked.</p>

<h2>Quick Unwrapping with .unwrap()</h2>

<p>When you are absolutely sure a value is <code>Some</code> and want to get the inner value quickly (often in prototyping or tests), you can call <code>.unwrap()</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let numbers = vec![2, 4, 6];
    let result = first_even(&amp;numbers).unwrap();
    println!("First even: {}", result); // 2
}</code></pre>
</div>

<div class="callout">
  <div class="callout-label">Warning: unwrap() Panics on None</div>
  <p>Calling <code>.unwrap()</code> on a <code>None</code> value causes an immediate runtime panic and crashes your program. Use it only when you are certain the value is <code>Some</code>, or in tests and examples. For production code, prefer <code>match</code>, <code>if let</code>, or <code>.unwrap_or(default)</code>.</p>
</div>

<h2>unwrap_or: A Safe Default</h2>

<p>When you want the inner value or a fallback default, <code>.unwrap_or()</code> is safe and concise:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let numbers = vec![1, 3, 5];
    let result = first_even(&amp;numbers).unwrap_or(0);
    println!("First even or 0: {}", result); // 0
}</code></pre>
</div>

<pre class="output"><code>First even or 0: 0</code></pre>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Using an Option Value Directly Without Unwrapping</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN
fn main() {
    let maybe: Option&lt;i32&gt; = Some(10);
    let doubled = maybe * 2; // error: cannot multiply Option&lt;i32&gt; by i32
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: extract the value first
fn main() {
    let maybe: Option&lt;i32&gt; = Some(10);
    if let Some(n) = maybe {
        let doubled = n * 2;
        println!("{}", doubled); // 20
    }
}</code></pre>
</div>

<h3>Mistake 2: Calling .unwrap() Without Considering None</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// RISKY: panics if the list has no even numbers
fn main() {
    let odds = vec![1, 3, 5];
    let n = first_even(&amp;odds).unwrap(); // PANIC: called unwrap on None
    println!("{}", n);
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: handle both cases explicitly
fn main() {
    let odds = vec![1, 3, 5];
    match first_even(&amp;odds) {
        Some(n) => println!("Found: {}", n),
        None    => println!("No even numbers"),
    }
}</code></pre>
</div>

<h3>Mistake 3: Confusing None with Zero or Empty String</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// CONCEPTUAL MISTAKE
// These are NOT the same thing:
let missing: Option&lt;i32&gt; = None;      // the value does not exist at all
let zero:    Option&lt;i32&gt; = Some(0);   // the value exists and it happens to be 0

// Treating them as the same would hide the difference between
// "no answer was found" and "the answer is 0".</code></pre>
</div>

<p>Use <code>None</code> to represent absence. Use <code>Some(0)</code> to represent a value that happens to be zero. The distinction matters in almost every real program.</p>
`
  },


  /* ---------------------------------------------------------------
     Chapter 15: Match Expressions
     --------------------------------------------------------------- */
  'ch15': {
    moduleNum: 3,
    moduleTitle: 'Structs, Enums & Data Modeling',
    chNum: 15,
    title: 'Match Expressions',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 3 &mdash; Chapter 15</span>
</div>

<h1>Match Expressions</h1>

<p>You have already seen <code>match</code> used with enums in the previous chapter. Now it is time to understand it deeply. <code>match</code> is one of Rust's most powerful features. It is more than a switch statement. It is a pattern-matching engine that can inspect values, destructure data, and check conditions, all while the compiler guarantees that every possible case is handled.</p>

<h2>The Sorting Machine Analogy</h2>

<p>Imagine a package sorting machine at a distribution center. Every package that arrives goes through the machine. The machine checks the package against a list of rules in order: "If it weighs more than 5kg, send to Bay A. If it is marked fragile, send to Bay B. If the destination is local, send to Bay C." The first matching rule decides where the package goes. No package can fall through the floor: if no other rule matches, there is always a default rule.</p>

<p>A <code>match</code> expression works exactly the same way. The value being matched enters the expression and is compared against each arm in order. The first arm whose pattern matches wins, and that arm's code runs. The compiler ensures no value can fail to match any arm.</p>

<h2>Basic Match Syntax</h2>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let number = 3;

    match number {
        1 => println!("one"),
        2 => println!("two"),
        3 => println!("three"),
        _ => println!("something else"),
    }
}</code></pre>
</div>

<pre class="output"><code>three</code></pre>

<p>Each line inside the <code>match</code> is an <strong>arm</strong>. An arm has two parts separated by <code>=&gt;</code>:</p>

<ul>
  <li>The left side is the <strong>pattern</strong> to compare against (1, 2, 3, or the wildcard _)</li>
  <li>The right side is the <strong>expression</strong> to evaluate if the pattern matches</li>
</ul>

<p>The <code>_</code> wildcard matches any value and is used as the catch-all arm to satisfy exhaustiveness.</p>

<h2>Match is an Expression</h2>

<p>Just like <code>if</code>, a <code>match</code> is an expression that produces a value. You can assign its result to a variable:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let coin = "quarter";

    let cents = match coin {
        "penny"   => 1,
        "nickel"  => 5,
        "dime"    => 10,
        "quarter" => 25,
        _         => 0,
    };

    println!("{} is worth {} cents", coin, cents);
}</code></pre>
</div>

<pre class="output"><code>quarter is worth 25 cents</code></pre>

<p>Every arm must produce the same type. If one arm returns an integer and another returns a string, the compiler refuses to build the program.</p>

<h2>Matching Enums with Data</h2>

<p>When an enum variant holds data, the match arm can extract that data by naming it in the pattern:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">enum Shape {
    Circle(f64),           // radius
    Rectangle(f64, f64),   // width, height
    Triangle(f64, f64, f64), // three sides
}

fn area(shape: &amp;Shape) -&gt; f64 {
    match shape {
        Shape::Circle(r) =&gt; std::f64::consts::PI * r * r,
        Shape::Rectangle(w, h) =&gt; w * h,
        Shape::Triangle(a, b, c) =&gt; {
            // Heron's formula
            let s = (a + b + c) / 2.0;
            (s * (s - a) * (s - b) * (s - c)).sqrt()
        }
    }
}

fn main() {
    let shapes = vec![
        Shape::Circle(5.0),
        Shape::Rectangle(4.0, 6.0),
        Shape::Triangle(3.0, 4.0, 5.0),
    ];

    for shape in &amp;shapes {
        println!("Area: {:.2}", area(shape));
    }
}</code></pre>
</div>

<pre class="output"><code>Area: 78.54
Area: 24.00
Area: 6.00</code></pre>

<p>The patterns <code>Shape::Circle(r)</code> and <code>Shape::Rectangle(w, h)</code> both match the variant and bind the inner values to new variable names (<code>r</code>, <code>w</code>, <code>h</code>) that you can use in the arm's body.</p>

<h2>Multiple Patterns with |</h2>

<p>Use the pipe character <code>|</code> to match several values with a single arm:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let n = 13;
    let label = match n {
        2 | 3 | 5 | 7 | 11 | 13 =&gt; "prime",
        1..=10                   =&gt; "small composite",
        _                        =&gt; "large",
    };
    println!("{} is {}", n, label);
}</code></pre>
</div>

<pre class="output"><code>13 is prime</code></pre>

<p>Patterns are tried in order from top to bottom. The value 13 is in the first arm's list, so it matches there even though 13 is greater than 10. The range arm <code>1..=10</code> would only be reached by values not already caught by the first arm.</p>

<h2>Match Guards</h2>

<p>A <strong>match guard</strong> is an extra <code>if</code> condition you can attach to a pattern. The arm only fires if the pattern matches AND the guard condition is true:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn describe(n: i32) -&gt; &amp;'static str {
    match n {
        n if n &lt; 0        =&gt; "negative",
        0                  =&gt; "zero",
        n if n % 2 == 0   =&gt; "positive even",
        _                  =&gt; "positive odd",
    }
}

fn main() {
    for n in [-5, 0, 4, 7] {
        println!("{}: {}", n, describe(n));
    }
}</code></pre>
</div>

<pre class="output"><code>-5: negative
0: zero
4: positive even
7: positive odd</code></pre>

<p>Match guards let you express conditions that cannot be written as a pure pattern, such as "any even number" or "any value greater than 100".</p>

<h2>Binding a Matched Value with @</h2>

<p>The <code>@</code> operator lets you match a pattern and simultaneously bind the matched value to a name:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let age = 17;

    let message = match age {
        n @ 0..=12  =&gt; format!("{} is a child", n),
        n @ 13..=17 =&gt; format!("{} is a teenager", n),
        n           =&gt; format!("{} is an adult", n),
    };

    println!("{}", message);
}</code></pre>
</div>

<pre class="output"><code>17 is a teenager</code></pre>

<p>Without <code>@</code>, a range pattern like <code>13..=17</code> would match the value but not give you access to it. With <code>n @ 13..=17</code>, the pattern matches the range and the value is also bound to <code>n</code>.</p>

<h2>if let: Concise Single-Arm Matching</h2>

<p>When you only care about one specific variant and want to ignore everything else, writing a full <code>match</code> with a <code>_ =&gt; ()</code> catch-all arm is verbose. The <code>if let</code> syntax is a concise alternative:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let config: Option&lt;u32&gt; = Some(200);

    // Full match (verbose for this use case)
    match config {
        Some(v) =&gt; println!("Config value: {}", v),
        None    =&gt; {}   // do nothing
    }

    // if let (concise)
    if let Some(v) = config {
        println!("Config value: {}", v);
    }
}</code></pre>
</div>

<pre class="output"><code>Config value: 200
Config value: 200</code></pre>

<p>Both produce identical behavior. Use <code>if let</code> when you only care about one pattern. Use <code>match</code> when you need to handle multiple cases.</p>

<p>You can also add an <code>else</code> block to <code>if let</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let value: Option&lt;i32&gt; = None;

    if let Some(v) = value {
        println!("Got: {}", v);
    } else {
        println!("Nothing here");
    }
}</code></pre>
</div>

<pre class="output"><code>Nothing here</code></pre>

<h2>while let: Loop Until a Pattern Fails</h2>

<p>The <code>while let</code> construct loops as long as a pattern keeps matching:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let mut stack = vec![1, 2, 3];

    // pop() returns Option&lt;T&gt;: Some(value) if stack has items, None when empty
    while let Some(top) = stack.pop() {
        println!("Popped: {}", top);
    }
    println!("Stack is empty");
}</code></pre>
</div>

<pre class="output"><code>Popped: 3
Popped: 2
Popped: 1
Stack is empty</code></pre>

<h2>Exhaustiveness: The Compiler Has Your Back</h2>

<p>The most important property of <code>match</code> in Rust is that it is <strong>exhaustive</strong>: the compiler checks that every possible value is covered by at least one arm. If you add a new variant to an enum and forget to handle it in a <code>match</code> somewhere, your code will not compile. This turns what would be a silent runtime bug into a compile-time error.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">enum Status { Active, Inactive, Pending }

fn describe(s: Status) -&gt; &amp;'static str {
    match s {
        Status::Active   =&gt; "active",
        Status::Inactive =&gt; "inactive",
        // Pending is not handled!
        // error: non-exhaustive patterns: Status::Pending not covered
    }
}</code></pre>
</div>

<div class="callout">
  <div class="callout-label">This is a Feature, Not a Bug</div>
  <p>Exhaustiveness enforcement is one of the biggest practical benefits of Rust's type system. In large codebases, when a new enum variant is added, the compiler immediately tells you every single place in the code that needs to be updated. No runtime surprise, no forgotten case.</p>
</div>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Returning Different Types from Match Arms</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN
fn main() {
    let x = 5;
    let result = match x {
        1 =&gt; "one",     // &amp;str
        _ =&gt; 42,        // i32
        // error: expected &amp;str, found integer
    };
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: all arms must return the same type
fn main() {
    let x = 5;
    let result = match x {
        1 =&gt; "one",
        _ =&gt; "other",
    };
    println!("{}", result);
}</code></pre>
</div>

<h3>Mistake 2: Forgetting a Variant in an Enum Match</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN
enum Light { Red, Yellow, Green }

fn action(light: Light) {
    match light {
        Light::Red   =&gt; println!("Stop"),
        Light::Green =&gt; println!("Go"),
        // error: non-exhaustive patterns: Light::Yellow not covered
    }
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: handle all variants
fn action(light: Light) {
    match light {
        Light::Red    =&gt; println!("Stop"),
        Light::Yellow =&gt; println!("Slow down"),
        Light::Green  =&gt; println!("Go"),
    }
}</code></pre>
</div>

<h3>Mistake 3: Placing a Catch-All Arm Before Specific Arms</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN (produces a warning: the specific arms are unreachable)
fn main() {
    let n = 2;
    match n {
        _ =&gt; println!("catch all"),  // matches everything, arms below never run
        1 =&gt; println!("one"),        // unreachable!
        2 =&gt; println!("two"),        // unreachable!
    }
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: put the catch-all last
fn main() {
    let n = 2;
    match n {
        1 =&gt; println!("one"),
        2 =&gt; println!("two"),
        _ =&gt; println!("catch all"),
    }
}</code></pre>
</div>
`
  },


  /* ---------------------------------------------------------------
     Chapter 16: Pattern Destructuring
     --------------------------------------------------------------- */
  'ch16': {
    moduleNum: 3,
    moduleTitle: 'Structs, Enums & Data Modeling',
    chNum: 16,
    title: 'Pattern Destructuring',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 3 &mdash; Chapter 16</span>
</div>

<h1>Pattern Destructuring</h1>

<p>You have been using patterns since Chapter 10. Every <code>match</code> arm is a pattern. Every <code>let</code> binding is a pattern. But so far, the patterns you have seen match simple values: a number, an enum variant, a wildcard.</p>

<p>Rust patterns can do much more than that. They can <strong>destructure</strong> a value, which means opening it up and pulling its internal parts out into named variables, all in one step. This is one of the most expressive features in Rust.</p>

<h2>The Unpacking Analogy</h2>

<p>When a delivery arrives in a box, you don't just say "I received a box." You open it up and say "I received a laptop, a charger, and a user manual." You give each item its own name and place. That is destructuring: instead of working with a compound value as a whole, you unpack it and name its parts.</p>

<h2>Destructuring Tuples</h2>

<p>Tuples are the simplest case. You can unpack their contents directly in a <code>let</code> statement:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let point = (3, 7);

    // Without destructuring
    let x1 = point.0;
    let y1 = point.1;
    println!("x={}, y={}", x1, y1);

    // With destructuring (much cleaner)
    let (x2, y2) = point;
    println!("x={}, y={}", x2, y2);
}</code></pre>
</div>

<pre class="output"><code>x=3, y=7
x=3, y=7</code></pre>

<p>The pattern <code>(x2, y2)</code> on the left of <code>=</code> mirrors the structure of the tuple on the right. Rust extracts the first element into <code>x2</code> and the second into <code>y2</code> in one operation.</p>

<p>You can mix this with match to handle functions that return tuples:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn min_max(numbers: &amp;[i32]) -&gt; (i32, i32) {
    let mut min = numbers[0];
    let mut max = numbers[0];
    for &amp;n in numbers {
        if n &lt; min { min = n; }
        if n &gt; max { max = n; }
    }
    (min, max)
}

fn main() {
    let data = vec![3, 1, 4, 1, 5, 9, 2, 6];
    let (smallest, largest) = min_max(&amp;data);
    println!("min={}, max={}", smallest, largest);
}</code></pre>
</div>

<pre class="output"><code>min=1, max=9</code></pre>

<h2>Destructuring Structs</h2>

<p>Structs can be destructured in exactly the same way. The pattern must name the fields you want to extract:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let p = Point { x: 5, y: 10 };

    // Destructure all fields
    let Point { x, y } = p;
    println!("x={}, y={}", x, y);
}</code></pre>
</div>

<pre class="output"><code>x=5, y=10</code></pre>

<p>When the variable names match the field names exactly (as above), you can use the shorthand. When you want different variable names, use the <code>field: new_name</code> syntax:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">struct Point { x: i32, y: i32 }

fn main() {
    let p = Point { x: 5, y: 10 };

    // Rename x to px, rename y to py
    let Point { x: px, y: py } = p;
    println!("px={}, py={}", px, py);
}</code></pre>
</div>

<pre class="output"><code>px=5, py=10</code></pre>

<h2>Ignoring Fields with ..</h2>

<p>When a struct has many fields but you only need a few of them, use <code>..</code> to ignore the rest:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">struct Player {
    name: String,
    level: u32,
    health: u32,
    mana: u32,
    gold: u32,
}

fn show_name_and_level(player: &amp;Player) {
    // Only extract name and level, ignore the rest
    let Player { name, level, .. } = player;
    println!("{} (level {})", name, level);
}

fn main() {
    let p = Player {
        name: String::from("Aldric"),
        level: 7,
        health: 100,
        mana: 50,
        gold: 320,
    };
    show_name_and_level(&amp;p);
}</code></pre>
</div>

<pre class="output"><code>Aldric (level 7)</code></pre>

<h2>Destructuring Enums</h2>

<p>Destructuring shines brightest with enums that carry data. When a match arm matches an enum variant, the pattern can simultaneously extract the data inside it:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">enum Message {
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(u8, u8, u8),
    Quit,
}

fn handle(msg: Message) {
    match msg {
        Message::Move { x, y } =&gt; {
            println!("Move to ({}, {})", x, y);
        }
        Message::Write(text) =&gt; {
            println!("Write: {}", text);
        }
        Message::ChangeColor(r, g, b) =&gt; {
            println!("Color: #{:02X}{:02X}{:02X}", r, g, b);
        }
        Message::Quit =&gt; {
            println!("Quit");
        }
    }
}

fn main() {
    handle(Message::Move { x: 10, y: 25 });
    handle(Message::Write(String::from("hello")));
    handle(Message::ChangeColor(255, 165, 0));
    handle(Message::Quit);
}</code></pre>
</div>

<pre class="output"><code>Move to (10, 25)
Write: hello
Color: #FFA500
Quit</code></pre>

<h2>Destructuring in for Loops</h2>

<p>Patterns work in <code>for</code> loop heads too. This is especially useful when iterating over a collection of tuples or pairs:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let scores = vec![
        ("Alice", 95),
        ("Bob",   82),
        ("Carol", 91),
    ];

    for (name, score) in &amp;scores {
        println!("{} scored {}", name, score);
    }
}</code></pre>
</div>

<pre class="output"><code>Alice scored 95
Bob scored 82
Carol scored 91</code></pre>

<h2>Destructuring in Function Parameters</h2>

<p>You can use patterns directly in function parameter positions. This is especially useful for functions that receive tuples:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Destructure a tuple right in the parameter list
fn print_point(&amp;(x, y): &amp;(i32, i32)) {
    println!("({}, {})", x, y);
}

fn main() {
    let points = vec![(1, 2), (3, 4), (5, 6)];
    for p in &amp;points {
        print_point(p);
    }
}</code></pre>
</div>

<pre class="output"><code>(1, 2)
(3, 4)
(5, 6)</code></pre>

<h2>Nested Patterns</h2>

<p>Patterns can be nested to any depth. If your data contains a struct inside an enum inside another struct, your pattern can reach inside all of it:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">#[derive(Debug)]
struct Point { x: i32, y: i32 }

enum Shape {
    Circle { center: Point, radius: f64 },
    Rectangle { top_left: Point, bottom_right: Point },
}

fn describe(shape: &amp;Shape) {
    match shape {
        Shape::Circle { center: Point { x, y }, radius } =&gt; {
            println!("Circle at ({},{}) with radius {}", x, y, radius);
        }
        Shape::Rectangle {
            top_left: Point { x: x1, y: y1 },
            bottom_right: Point { x: x2, y: y2 },
        } =&gt; {
            println!("Rectangle from ({},{}) to ({},{})", x1, y1, x2, y2);
        }
    }
}

fn main() {
    let c = Shape::Circle {
        center: Point { x: 0, y: 0 },
        radius: 5.0,
    };
    let r = Shape::Rectangle {
        top_left: Point { x: 1, y: 4 },
        bottom_right: Point { x: 6, y: 1 },
    };
    describe(&amp;c);
    describe(&amp;r);
}</code></pre>
</div>

<pre class="output"><code>Circle at (0,0) with radius 5
Rectangle from (1,4) to (6,1)</code></pre>

<h2>Ignoring Values with _ and ..</h2>

<p>Two special patterns help you skip data you do not need:</p>

<dl>
  <dt><code>_</code> (single underscore)</dt>
  <dd>Ignores a single value in any position. Does not bind the value to a name.</dd>
  <dt><code>..</code> (double dot)</dt>
  <dd>Ignores the remaining fields in a struct, or the remaining elements in a tuple. Must appear only once per pattern.</dd>
</dl>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let numbers = (2, 4, 8, 16, 32);

    // Extract only the first and last, ignore the middle
    let (first, .., last) = numbers;
    println!("First: {}, Last: {}", first, last);

    // Ignore middle values with individual _
    let (a, _, _, _, e) = numbers;
    println!("a: {}, e: {}", a, e);
}</code></pre>
</div>

<pre class="output"><code>First: 2, Last: 32
a: 2, e: 32</code></pre>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Using Tuple Syntax to Destructure a Struct</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN
struct Point { x: i32, y: i32 }

fn main() {
    let p = Point { x: 5, y: 10 };
    let (x, y) = p; // error: expected a tuple, found Point
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: use struct pattern
fn main() {
    let p = Point { x: 5, y: 10 };
    let Point { x, y } = p; // correct
}</code></pre>
</div>

<h3>Mistake 2: Wrong Field Name in Struct Destructuring</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN
struct Rectangle { width: u32, height: u32 }

fn main() {
    let r = Rectangle { width: 10, height: 20 };
    let Rectangle { w, h } = r; // error: no field 'w' in Rectangle
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: use actual field names, or rename with colon syntax
fn main() {
    let r = Rectangle { width: 10, height: 20 };

    // Option 1: use actual field names
    let Rectangle { width, height } = r;

    // Option 2: rename with field: new_name syntax
    // let Rectangle { width: w, height: h } = r;
}</code></pre>
</div>

<h3>Mistake 3: Using .. More Than Once in the Same Pattern</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN
fn main() {
    let t = (1, 2, 3, 4, 5);
    let (.., middle, ..) = t; // error: .. can only be used once per tuple pattern
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: use _ for specific positions instead
fn main() {
    let t = (1, 2, 3, 4, 5);
    let (_, _, middle, _, _) = t;
    println!("{}", middle); // 3
}</code></pre>
</div>
`
  },


  /* ---------------------------------------------------------------
     Chapter 17: Designing Custom Data Types
     --------------------------------------------------------------- */
  'ch17': {
    moduleNum: 3,
    moduleTitle: 'Structs, Enums & Data Modeling',
    chNum: 17,
    title: 'Designing Custom Data Types',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 3 &mdash; Chapter 17</span>
</div>

<h1>Designing Custom Data Types</h1>

<p>You have now learned all the building blocks: structs, associated functions, methods, enums, Option, match, and pattern destructuring. This final chapter in Module 3 shows you how to put them together to design data types that accurately model real-world problems.</p>

<p>Knowing <em>what</em> the tools do is not enough. Knowing <em>when to use which one</em> and <em>how to combine them</em> is where software design lives. This chapter focuses on that judgment.</p>

<h2>The Blueprint Analogy</h2>

<p>Before any building is constructed, an architect draws blueprints. The blueprints do not just describe what the building looks like today. They make certain configurations impossible: a wall cannot be in two places, a door must have a frame, a room cannot have negative area. Good blueprints encode constraints so that workers cannot accidentally build something that violates the design.</p>

<p>Good Rust data types work the same way. When you design your types well, invalid states cannot be represented. The compiler becomes your enforcer, preventing entire categories of bugs before the program ever runs.</p>

<h2>Struct vs Enum: When to Use Which</h2>

<p>This is the most important decision in data modeling. The choice comes down to one question:</p>

<dl>
  <dt>Use a struct when:</dt>
  <dd>Your thing has multiple properties that all exist at the same time. A user always has a name AND an email AND an age. All fields coexist.</dd>
  <dt>Use an enum when:</dt>
  <dd>Your thing can be in one of several mutually exclusive states. A connection is either Open OR Closed OR Connecting. Only one state is active at a time.</dd>
</dl>

<p>In computer science terms, a struct is a <strong>product type</strong> (it has field A AND field B AND field C). An enum is a <strong>sum type</strong> (it is variant A OR variant B OR variant C).</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Struct: a user ALWAYS has all these fields at once
struct User {
    username: String,
    email: String,
    age: u32,
}

// Enum: a connection is in exactly ONE state at a time
enum ConnectionState {
    Disconnected,
    Connecting { host: String, port: u16 },
    Connected { session_id: u64 },
    Failed { reason: String },
}</code></pre>
</div>

<h2>Composing Structs and Enums</h2>

<p>The real power comes when you combine them. A struct can contain enum fields, and enum variants can contain structs. This lets you build rich, accurate models of complex real-world data:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">#[derive(Debug)]
struct Address {
    street: String,
    city: String,
    country: String,
}

#[derive(Debug)]
enum ContactMethod {
    Email(String),
    Phone(String),
    PostalMail(Address),
}

#[derive(Debug)]
struct Contact {
    name: String,
    method: ContactMethod,
}

fn main() {
    let contacts = vec![
        Contact {
            name: String::from("Alice"),
            method: ContactMethod::Email(String::from("alice@example.com")),
        },
        Contact {
            name: String::from("Bob"),
            method: ContactMethod::Phone(String::from("+1-555-0100")),
        },
        Contact {
            name: String::from("Carol"),
            method: ContactMethod::PostalMail(Address {
                street: String::from("10 Rust Lane"),
                city: String::from("Ferropolis"),
                country: String::from("Oxidia"),
            }),
        },
    ];

    for contact in &amp;contacts {
        match &amp;contact.method {
            ContactMethod::Email(e)          =&gt; println!("{}: email {}", contact.name, e),
            ContactMethod::Phone(p)          =&gt; println!("{}: phone {}", contact.name, p),
            ContactMethod::PostalMail(addr)  =&gt; println!("{}: mail to {}", contact.name, addr.city),
        }
    }
}</code></pre>
</div>

<pre class="output"><code>Alice: email alice@example.com
Bob: phone +1-555-0100
Carol: mail to Ferropolis</code></pre>

<h2>Make Illegal States Unrepresentable</h2>

<p>This is the most important principle in Rust data modeling. The idea is: instead of relying on runtime checks or documentation to enforce rules, encode those rules into the type system so that violating them is impossible to compile.</p>

<p>Consider modeling a task in a todo list. A naive approach uses booleans and Options:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BAD design: booleans and options that can contradict each other
struct TaskBad {
    title: String,
    is_done: bool,
    completed_at: Option&lt;String&gt;,  // should only be Some when is_done is true
    assigned_to: Option&lt;String&gt;,   // should only be set when not done
}

// Nothing stops you from creating this invalid state:
let broken = TaskBad {
    title: String::from("Fix bug"),
    is_done: false,          // says not done
    completed_at: Some(String::from("2024-01-15")), // but has a completion date!
    assigned_to: None,
};</code></pre>
</div>

<p>The struct <code>TaskBad</code> allows contradictory data. <code>is_done: false</code> combined with <code>completed_at: Some(...)</code> makes no sense, yet nothing prevents it. Now consider an enum-based design:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// GOOD design: each state carries exactly the data it needs
#[derive(Debug)]
enum TaskStatus {
    Todo,
    InProgress { assigned_to: String },
    Done { completed_at: String },
    Cancelled { reason: String },
}

#[derive(Debug)]
struct Task {
    id: u32,
    title: String,
    status: TaskStatus,
}

impl Task {
    fn new(id: u32, title: &amp;str) -&gt; Self {
        Self {
            id,
            title: String::from(title),
            status: TaskStatus::Todo,
        }
    }

    fn assign(&amp;mut self, person: &amp;str) {
        self.status = TaskStatus::InProgress {
            assigned_to: String::from(person),
        };
    }

    fn complete(&amp;mut self, date: &amp;str) {
        self.status = TaskStatus::Done {
            completed_at: String::from(date),
        };
    }

    fn is_active(&amp;self) -&gt; bool {
        matches!(self.status, TaskStatus::InProgress { .. })
    }
}

fn main() {
    let mut task = Task::new(1, "Write documentation");
    println!("Created: {:?}", task.status);

    task.assign("Alice");
    println!("Assigned: {:?}", task.status);
    println!("Is active: {}", task.is_active());

    task.complete("2024-03-15");
    println!("Completed: {:?}", task.status);
    println!("Is active: {}", task.is_active());
}</code></pre>
</div>

<pre class="output"><code>Created: Todo
Assigned: InProgress { assigned_to: "Alice" }
Is active: true
Completed: Done { completed_at: "2024-03-15" }
Is active: false</code></pre>

<p>With this design, a <code>Done</code> task cannot have an assigned_to field. An <code>InProgress</code> task cannot have a completed_at date. It is literally impossible to construct an invalid combination because the type system prevents it.</p>

<h2>The Newtype Pattern</h2>

<p>Sometimes you want to create a distinct type from an existing one to prevent accidental mixing. For example, you might have both meters and kilometers in your program. Both are <code>f64</code> values, but mixing them by accident would be a disaster.</p>

<p>The <strong>newtype pattern</strong> wraps an existing type in a single-field struct to give it a distinct identity:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">struct Meters(f64);
struct Kilometers(f64);

fn travel(distance: Kilometers) {
    println!("Traveling {:.1} km", distance.0);
}

fn main() {
    let d = Kilometers(42.0);
    travel(d);  // works

    let m = Meters(100.0);
    // travel(m); // compile error: expected Kilometers, found Meters
}</code></pre>
</div>

<p>The inner value is accessed with <code>.0</code> because it is a tuple struct (a struct with unnamed fields). We will revisit the newtype pattern in depth in later modules. For now, remember that creating a thin wrapper struct is a zero-cost way to get type safety.</p>

<h2>A Complete Data Modeling Example</h2>

<p>Here is a worked example that models a simple library system, pulling together everything from this module:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">#[derive(Debug)]
struct BookId(u32); // newtype for safety

#[derive(Debug)]
struct Book {
    id: BookId,
    title: String,
    author: String,
}

#[derive(Debug)]
enum LoanStatus {
    Available,
    CheckedOut { borrower: String, due_date: String },
    Reserved { by: String },
    LostOrDamaged,
}

#[derive(Debug)]
struct LibraryRecord {
    book: Book,
    status: LoanStatus,
}

impl LibraryRecord {
    fn new(id: u32, title: &amp;str, author: &amp;str) -&gt; Self {
        Self {
            book: Book {
                id: BookId(id),
                title: String::from(title),
                author: String::from(author),
            },
            status: LoanStatus::Available,
        }
    }

    fn check_out(&amp;mut self, borrower: &amp;str, due: &amp;str) {
        self.status = LoanStatus::CheckedOut {
            borrower: String::from(borrower),
            due_date: String::from(due),
        };
    }

    fn is_available(&amp;self) -&gt; bool {
        matches!(self.status, LoanStatus::Available)
    }
}

fn main() {
    let mut record = LibraryRecord::new(1001, "The Rust Programming Language", "Steve Klabnik");

    println!("Available: {}", record.is_available()); // true

    record.check_out("Alice", "2024-04-01");
    println!("Available: {}", record.is_available()); // false

    match &amp;record.status {
        LoanStatus::CheckedOut { borrower, due_date } =&gt; {
            println!("Checked out by {} until {}", borrower, due_date);
        }
        _ =&gt; println!("Not checked out"),
    }
}</code></pre>
</div>

<pre class="output"><code>Available: true
Available: false
Checked out by Alice until 2024-04-01</code></pre>

<h2>Design Checklist</h2>

<p>When designing a new data type in Rust, ask yourself these questions:</p>

<div class="step">
  <div class="step-num">1</div>
  <div class="step-body"><p>Does this thing always have all its parts at once? If yes, use a struct. If it can be in different states, use an enum.</p></div>
</div>

<div class="step">
  <div class="step-num">2</div>
  <div class="step-body"><p>Can my type represent invalid combinations of data? If yes, refactor: move the varying data into enum variants so invalid combinations cannot be constructed.</p></div>
</div>

<div class="step">
  <div class="step-num">3</div>
  <div class="step-body"><p>Do I need to distinguish two values of the same underlying type (like meters vs kilometers)? If yes, use the newtype pattern.</p></div>
</div>

<div class="step">
  <div class="step-num">4</div>
  <div class="step-body"><p>What methods belong to this type? Add a new() constructor if there is a natural way to create it, and add methods for operations that naturally belong to the type.</p></div>
</div>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Using a Struct When an Enum Is Needed</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BAD: booleans encoding mutually exclusive states
struct Connection {
    host: String,
    is_connecting: bool,
    is_connected: bool,
    is_failed: bool,
    // These three booleans can all be true or all be false at once!
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// GOOD: enum makes the states mutually exclusive
enum Connection {
    Connecting { host: String },
    Connected { host: String, session_id: u64 },
    Failed { host: String, reason: String },
}</code></pre>
</div>

<h3>Mistake 2: Storing Optional Data That Belongs in a Specific State</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BAD: session_id is only valid when connected, but it's always in the struct
struct Connection {
    host: String,
    connected: bool,
    session_id: Option&lt;u64&gt;, // meaningless when connected is false
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// GOOD: session_id only exists in the Connected variant
enum Connection {
    Disconnected,
    Connected { host: String, session_id: u64 },
    // no session_id field in Disconnected — it literally cannot exist here
}</code></pre>
</div>

<h3>Mistake 3: Using a Raw Type Where a Newtype Would Prevent Bugs</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BAD: easy to pass arguments in wrong order
fn create_user(id: u32, age: u32, score: u32) { /* ... */ }

fn main() {
    create_user(25, 1001, 850); // Is 25 the id, age, or score? Easy to mix up!
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// GOOD: newtypes make the intent clear and catch transpositions at compile time
struct UserId(u32);
struct Age(u32);
struct Score(u32);

fn create_user(id: UserId, age: Age, score: Score) { /* ... */ }

fn main() {
    create_user(UserId(1001), Age(25), Score(850)); // clear and type-safe
}</code></pre>
</div>
`
  },

});
