Object.assign(CHAPTERS_CONTENT, {
  'ch90': {
    moduleNum: 14,
    moduleTitle: 'Macros &amp; Metaprogramming',
    chNum: 90,
    title: 'macro_rules!',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 14 &mdash; Chapter 90</span>
</div>
<h1>macro_rules!</h1>

<p>Rust has two kinds of macros. This chapter covers the first and simpler kind: <strong>declarative macros</strong>, written with <code>macro_rules!</code>. These let you write code that writes code, using pattern matching on fragments of Rust syntax rather than on values.</p>

<p>You have been using declarative macros throughout this course. <code>println!</code>, <code>vec!</code>, <code>format!</code>, and <code>assert!</code> are all declarative macros defined with <code>macro_rules!</code>.</p>

<h2>Analogy: A Rubber Stamp</h2>

<p>Imagine you work at an office and need to stamp hundreds of forms with the same text: "APPROVED — Dept. 4B". Instead of writing it by hand each time, you have a rubber stamp. You press the stamp to the paper and the text appears instantly. The stamp is the macro: a reusable template that produces the same output pattern wherever you apply it, but can be filled in with different names, dates, or numbers each time.</p>

<h2>Defining a Simple Macro</h2>

<p>A <code>macro_rules!</code> definition looks like a <code>match</code> expression, but it matches on syntax patterns rather than values:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">macro_rules! greet {
    ($name:expr) => {
        println!("Hello, {}!", $name);
    };
}

fn main() {
    greet!("Rust");   // Hello, Rust!
    greet!("World");  // Hello, World!
    greet!(42);       // Hello, 42!
}</code></pre>
</div>

<pre class="output"><code>Hello, Rust!
Hello, World!
Hello, 42!</code></pre>

<p>Breaking this down:</p>
<dl>
  <dt><code>$name:expr</code></dt>
  <dd>A <em>metavariable</em>. <code>$name</code> is the name you give it. <code>expr</code> is the <em>fragment specifier</em>: it matches any Rust expression.</dd>
  <dt><code>=> { ... }</code></dt>
  <dd>The template: what the macro expands to when the pattern matches. <code>$name</code> inside the template is replaced with whatever was matched.</dd>
</dl>

<h2>Fragment Specifiers</h2>

<p>The fragment specifier after <code>:</code> tells the macro what kind of syntax to match. The most common ones are:</p>

<dl>
  <dt><code>expr</code></dt>
  <dd>Any expression: <code>1 + 2</code>, <code>"hello"</code>, <code>some_func()</code></dd>
  <dt><code>ident</code></dt>
  <dd>An identifier (name): <code>foo</code>, <code>my_variable</code>, <code>SomeType</code></dd>
  <dt><code>ty</code></dt>
  <dd>A type: <code>i32</code>, <code>String</code>, <code>Vec&lt;u8&gt;</code></dd>
  <dt><code>pat</code></dt>
  <dd>A pattern: <code>Some(x)</code>, <code>(a, b)</code>, <code>1..=5</code></dd>
  <dt><code>stmt</code></dt>
  <dd>A statement (with semicolon)</dd>
  <dt><code>tt</code></dt>
  <dd>A single token tree: the most flexible, matches almost anything</dd>
  <dt><code>literal</code></dt>
  <dd>A literal value: <code>42</code>, <code>"hello"</code>, <code>3.14</code></dd>
</dl>

<h2>Multiple Patterns</h2>

<p>A macro can have multiple arms, matched from top to bottom, just like <code>match</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">macro_rules! describe {
    (true)       =&gt; { println!("That is true!") };
    (false)      =&gt; { println!("That is false!") };
    ($x:literal) =&gt; { println!("The literal is: {}", $x) };
    ($x:expr)    =&gt; { println!("The expression evaluates to: {}", $x) };
}

fn main() {
    describe!(true);
    describe!(false);
    describe!(3.14);
    describe!(2 + 2);
}</code></pre>
</div>

<pre class="output"><code>That is true!
That is false!
The literal is: 3.14
The expression evaluates to: 4</code></pre>

<h2>Repetition: Matching Multiple Items</h2>

<p>The <code>$(...)*</code> syntax matches zero or more repetitions, and <code>$(...)+</code> matches one or more. This is how <code>vec!</code> is implemented in the standard library:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">macro_rules! my_vec {
    // Match a comma-separated list of zero or more expressions
    ($($item:expr),*) =&gt; {{
        let mut v = Vec::new();
        $(
            v.push($item);
        )*
        v
    }};
}

fn main() {
    let nums = my_vec![10, 20, 30, 40];
    println!("{:?}", nums); // [10, 20, 30, 40]

    let empty: Vec&lt;i32&gt; = my_vec![];
    println!("{:?}", empty); // []
}</code></pre>
</div>

<pre class="output"><code>[10, 20, 30, 40]
[]</code></pre>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>The double braces <code>{{ }}</code> in the expansion are needed because the macro needs to be a block expression (the outer braces belong to the macro syntax, the inner ones form the Rust block). Similarly, <code>$(v.push($item);)*</code> repeats the push statement once per matched item.</p>
</div>

<h2>The stringify! and concat! Built-in Macros</h2>

<p>Rust's standard library includes utility macros useful inside other macros. <code>stringify!</code> converts an expression to its source-code string at compile time:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">macro_rules! log_expr {
    ($x:expr) =&gt; {{
        let val = $x;
        println!("[LOG] {} = {:?}", stringify!($x), val);
        val
    }};
}

fn main() {
    let a = log_expr!(2 + 3);
    let b = log_expr!(a * 10);
    println!("Final: {}", b);
}</code></pre>
</div>

<pre class="output"><code>[LOG] 2 + 3 = 5
[LOG] a * 10 = 50
Final: 50</code></pre>

<h2>Creating a HashMap with a Macro</h2>

<p>Here is a practical example: a macro that creates a <code>HashMap</code> from key-value pairs, similar to Python's <code>{k: v, ...}</code> syntax:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::collections::HashMap;

macro_rules! map {
    ($($key:expr =&gt; $val:expr),* $(,)?) =&gt; {{
        let mut m = HashMap::new();
        $(
            m.insert($key, $val);
        )*
        m
    }};
}

fn main() {
    let scores = map! {
        "Alice" =&gt; 95,
        "Bob"   =&gt; 87,
        "Carol" =&gt; 91,
    };
    println!("{:?}", scores);
}</code></pre>
</div>

<pre class="output"><code>{"Alice": 95, "Bob": 87, "Carol": 91}</code></pre>

<p>The pattern <code>$(,)?</code> at the end makes a trailing comma optional.</p>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Forgetting the semicolon between macro arms</h3>
<p>Each arm in a <code>macro_rules!</code> block must end with a semicolon.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BUG: missing semicolons after each arm
macro_rules! greet {
    ($name:expr) =&gt; { println!("Hi, {}!", $name) }  // missing ;
    () =&gt; { println!("Hi!") }                         // missing ;
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: semicolons after each arm
macro_rules! greet {
    ($name:expr) =&gt; { println!("Hi, {}!", $name) };
    () =&gt; { println!("Hi!") };
}</code></pre>
</div>

<h3>Mistake 2: Using the wrong fragment specifier</h3>
<p>If you use <code>expr</code> where you need <code>ident</code>, the macro will fail to expand when passed an identifier in certain positions.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BUG: using expr for a variable declaration — ident is needed
macro_rules! make_var {
    ($name:expr) =&gt; { let $name = 0; }; // compile error: expected identifier
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: use ident for variable names
macro_rules! make_var {
    ($name:ident) =&gt; { let $name = 0; };
}

fn main() {
    make_var!(x);
    println!("{}", x); // 0
}</code></pre>
</div>

<h3>Mistake 3: Missing double braces for block macros</h3>
<p>If a macro expands to a block that should evaluate to a value, the inner braces forming the block are required.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BUG: single braces — this is the macro syntax, not a Rust block
macro_rules! double {
    ($x:expr) =&gt; {
        let result = $x * 2;
        result  // error: macros used as expressions must have one arm
    };
}

// FIXED: double braces make the inner {} a Rust block expression
macro_rules! double {
    ($x:expr) =&gt; {{
        let result = $x * 2;
        result
    }};
}

fn main() {
    let d = double!(21);
    println!("{}", d); // 42
}</code></pre>
</div>
`
  },

  'ch91': {
    moduleNum: 14,
    moduleTitle: 'Macros &amp; Metaprogramming',
    chNum: 91,
    title: 'Derive Macros',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 14 &mdash; Chapter 91</span>
</div>
<h1>Derive Macros</h1>

<p>The <code>#[derive(...)]</code> attribute is one of Rust's most used features. It automatically generates implementations of standard traits for your types. Instead of writing 30 lines of boilerplate to make a struct printable and comparable, you write one line: <code>#[derive(Debug, PartialEq)]</code>.</p>

<p>This chapter covers all the built-in derivable traits and when to use each. How to write your own derive macro is covered in Chapter 94.</p>

<h2>Analogy: The Government Form-Filler</h2>

<p>When a new employee joins a company, the HR department must fill out a stack of identical forms: tax forms, benefit forms, payroll forms. All of them ask for the same information: name, address, employee ID. A smart HR system reads the employee record once and fills all the forms automatically.</p>

<p><code>#[derive]</code> is that system. You define your struct once with all its fields, and the derive attribute reads it and generates all the boilerplate implementations automatically.</p>

<h2>Debug: Making Types Printable</h2>

<p><code>Debug</code> implements the <code>{:?}</code> and <code>{:#?}</code> format specifiers. Almost every type should derive it:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">#[derive(Debug)]
struct Point {
    x: f64,
    y: f64,
}

#[derive(Debug)]
enum Direction {
    North,
    South,
    East,
    West,
}

fn main() {
    let p = Point { x: 3.0, y: 4.0 };
    let d = Direction::North;

    println!("{:?}", p);   // Point { x: 3.0, y: 4.0 }
    println!("{:#?}", p);  // pretty-printed with newlines
    println!("{:?}", d);   // North
}</code></pre>
</div>

<pre class="output"><code>Point { x: 3.0, y: 4.0 }
Point {
    x: 3.0,
    y: 4.0,
}
North</code></pre>

<h2>Clone and Copy</h2>

<p><code>Clone</code> allows explicit duplication with <code>.clone()</code>. <code>Copy</code> allows implicit bitwise duplication (no move semantics): the value can be used after assignment without cloning.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">#[derive(Debug, Clone, Copy)]
struct Color {
    r: u8,
    g: u8,
    b: u8,
}

fn print_color(c: Color) {
    println!("rgb({}, {}, {})", c.r, c.g, c.b);
}

fn main() {
    let red = Color { r: 255, g: 0, b: 0 };
    print_color(red);    // red is COPIED into the function
    print_color(red);    // still valid because Color is Copy
    println!("{:?}", red); // still valid
}</code></pre>
</div>

<pre class="output"><code>rgb(255, 0, 0)
rgb(255, 0, 0)
Color { r: 255, g: 0, b: 0 }</code></pre>

<div class="callout">
  <div class="callout-label">Note</div>
  <p><code>Copy</code> can only be derived if every field is also <code>Copy</code>. Types containing <code>String</code>, <code>Vec</code>, <code>Box</code>, or any heap-owning type cannot be <code>Copy</code> because they cannot be safely bitwise-copied.</p>
</div>

<h2>PartialEq and Eq: Equality Comparison</h2>

<p><code>PartialEq</code> enables <code>==</code> and <code>!=</code>. <code>Eq</code> is a marker trait that says equality is total (reflexive, symmetric, transitive for all values). Derive both together:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">#[derive(Debug, PartialEq, Eq)]
struct Version {
    major: u32,
    minor: u32,
    patch: u32,
}

fn main() {
    let v1 = Version { major: 1, minor: 2, patch: 3 };
    let v2 = Version { major: 1, minor: 2, patch: 3 };
    let v3 = Version { major: 2, minor: 0, patch: 0 };

    println!("v1 == v2: {}", v1 == v2); // true
    println!("v1 == v3: {}", v1 == v3); // false
    println!("v1 != v3: {}", v1 != v3); // true
}</code></pre>
</div>

<pre class="output"><code>v1 == v2: true
v1 == v3: false
v1 != v3: true</code></pre>

<h2>PartialOrd and Ord: Ordering</h2>

<p><code>PartialOrd</code> enables <code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code>, <code>&gt;=</code>. <code>Ord</code> enables total ordering (required for sorting and for use in <code>BTreeMap</code>). Both require <code>PartialEq</code> and <code>Eq</code> to already be derived. The derived implementation compares fields in declaration order:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
struct Version {
    major: u32,
    minor: u32,
    patch: u32,
}

fn main() {
    let mut versions = vec![
        Version { major: 1, minor: 10, patch: 0 },
        Version { major: 2, minor: 0,  patch: 0 },
        Version { major: 1, minor: 2,  patch: 3 },
    ];

    versions.sort(); // uses Ord

    for v in &amp;versions {
        println!("{}.{}.{}", v.major, v.minor, v.patch);
    }
}</code></pre>
</div>

<pre class="output"><code>1.2.3
1.10.0
2.0.0</code></pre>

<h2>Hash: Using Types as HashMap Keys</h2>

<p>To use a type as a key in <code>HashMap</code> or <code>HashSet</code>, it must implement <code>Hash</code> and <code>Eq</code>. Both can be derived:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::collections::HashMap;

#[derive(Debug, PartialEq, Eq, Hash)]
struct GridPos {
    row: i32,
    col: i32,
}

fn main() {
    let mut grid: HashMap&lt;GridPos, &amp;str&gt; = HashMap::new();
    grid.insert(GridPos { row: 0, col: 0 }, "origin");
    grid.insert(GridPos { row: 1, col: 2 }, "off-center");

    let key = GridPos { row: 0, col: 0 };
    println!("{:?}", grid.get(&amp;key)); // Some("origin")
}</code></pre>
</div>

<pre class="output"><code>Some("origin")</code></pre>

<h2>Default: Zero-Value Construction</h2>

<p><code>Default</code> provides a <code>Default::default()</code> constructor that creates a "zero" or "empty" value. Every field must also implement <code>Default</code>. It integrates with the struct update syntax <code>..Default::default()</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">#[derive(Debug, Default)]
struct Config {
    width: u32,       // defaults to 0
    height: u32,      // defaults to 0
    title: String,    // defaults to ""
    fullscreen: bool, // defaults to false
}

fn main() {
    let defaults = Config::default();
    println!("{:?}", defaults);
    // Config { width: 0, height: 0, title: "", fullscreen: false }

    // Override specific fields, use defaults for the rest
    let window = Config {
        width: 1920,
        height: 1080,
        title: String::from("My App"),
        ..Config::default()
    };
    println!("{:?}", window);
}</code></pre>
</div>

<pre class="output"><code>Config { width: 0, height: 0, title: "", fullscreen: false }
Config { width: 1920, height: 1080, title: "My App", fullscreen: false }</code></pre>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Deriving Copy on a type with heap-allocated fields</h3>
<p>Types containing <code>String</code>, <code>Vec</code>, <code>Box</code>, or similar owned heap types cannot be <code>Copy</code>. The compiler will tell you clearly.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BUG: String is not Copy, so this struct cannot be Copy either
#[derive(Clone, Copy)]
struct Person {
    name: String, // compile error: String does not implement Copy
    age: u32,
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: derive only Clone (not Copy) when fields own heap data
#[derive(Debug, Clone)]
struct Person {
    name: String,
    age: u32,
}

fn main() {
    let p1 = Person { name: String::from("Alice"), age: 30 };
    let p2 = p1.clone(); // explicit clone required
    println!("{} and {}", p1.name, p2.name);
}</code></pre>
</div>

<h3>Mistake 2: Deriving Ord without the full chain</h3>
<p><code>Ord</code> requires <code>PartialOrd</code>, which requires <code>PartialEq</code>, which requires <code>Eq</code>. Skipping any of them causes a compile error.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BUG: Ord requires the full chain but PartialOrd and Eq are missing
#[derive(Ord)]
struct Score(i32);</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: derive the full chain in order
#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
struct Score(i32);</code></pre>
</div>

<h3>Mistake 3: Implementing Hash manually but deriving PartialEq</h3>
<p>If you implement <code>Hash</code> manually, you must also manually implement <code>PartialEq</code> (or vice versa) to ensure the invariant: <code>a == b</code> implies <code>hash(a) == hash(b)</code>. Mixing manual and derived implementations often violates this.</p>
`
  },

  'ch92': {
    moduleNum: 14,
    moduleTitle: 'Macros &amp; Metaprogramming',
    chNum: 92,
    title: 'Attribute Macros',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 14 &mdash; Chapter 92</span>
</div>
<h1>Attribute Macros</h1>

<p>In Rust, an <em>attribute</em> is a piece of metadata attached to an item: a function, struct, module, or crate. Attributes look like <code>#[name]</code> or <code>#[name(args)]</code>. You have been using built-in attributes throughout this course: <code>#[test]</code>, <code>#[derive(...)]</code>, <code>#[allow(...)]</code>, <code>#[cfg(...)]</code>.</p>

<p>An <strong>attribute macro</strong> is a procedural macro that is invoked as an attribute. It takes the item it is attached to as input, transforms it, and returns new code. Unlike <code>macro_rules!</code>, attribute macros are written in Rust code and compiled as a separate crate.</p>

<h2>Analogy: A Stamp of Transformation</h2>

<p>Imagine a legal document stamped "NOTARIZED". The stamp does not just label the document. It transforms it: adding a seal, a date, a witness signature. The notary (the attribute macro) takes your document (the item), augments it according to a standard procedure, and returns the transformed result. The client sees the final notarized document, not the raw input.</p>

<h2>Built-in Attributes You Already Know</h2>

<p>Rust ships with many built-in attributes. Understanding how they work conceptually prepares you to write your own:</p>

<dl>
  <dt><code>#[test]</code></dt>
  <dd>Marks a function as a unit test. The test runner calls it and reports pass/fail based on whether it panics.</dd>
  <dt><code>#[cfg(condition)]</code></dt>
  <dd>Conditional compilation. The item is only included in the binary when the condition is true.</dd>
  <dt><code>#[allow(lint_name)]</code></dt>
  <dd>Suppresses a compiler warning for the attached item.</dd>
  <dt><code>#[inline]</code></dt>
  <dd>Hints to the compiler to inline the function at call sites.</dd>
  <dt><code>#[no_mangle]</code></dt>
  <dd>Prevents the compiler from mangling the function's symbol name (used for FFI).</dd>
</dl>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">#[cfg(target_os = "linux")]
fn platform_greeting() {
    println!("Hello from Linux!");
}

#[cfg(target_os = "windows")]
fn platform_greeting() {
    println!("Hello from Windows!");
}

#[allow(dead_code)]
fn unused_function() {
    // The compiler won't warn about this being unused
}

#[test]
fn my_test() {
    assert_eq!(2 + 2, 4);
}

fn main() {
    platform_greeting();
}</code></pre>
</div>

<h2>How Attribute Macros Work</h2>

<p>An attribute macro receives two inputs and returns one output:</p>

<dl>
  <dt>Input 1: <code>args: TokenStream</code></dt>
  <dd>The arguments inside the attribute parentheses: for <code>#[my_attr(debug, timeout=5)]</code>, this would be <code>debug, timeout=5</code>.</dd>
  <dt>Input 2: <code>item: TokenStream</code></dt>
  <dd>The entire item the attribute is attached to (the function, struct, etc.).</dd>
  <dt>Output: <code>TokenStream</code></dt>
  <dd>The replacement code. The original item is completely replaced by whatever the macro returns. You can return the same item unchanged, a modified version, or something entirely different.</dd>
</dl>

<h2>The Structure of an Attribute Macro Crate</h2>

<p>Attribute macros live in a separate crate with <code>proc-macro = true</code> in its <code>Cargo.toml</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">toml</span>
  <pre><code class="language-toml"># my-macros/Cargo.toml
[package]
name = "my-macros"
version = "0.1.0"
edition = "2021"

[lib]
proc-macro = true

[dependencies]
# syn and quote for parsing and generating code (optional for simple macros)
</code></pre>
</div>

<p>The macro is defined in <code>src/lib.rs</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// my-macros/src/lib.rs
use proc_macro::TokenStream;

// #[proc_macro_attribute] marks this as an attribute macro.
// Function name becomes the attribute name: #[passthrough]
#[proc_macro_attribute]
pub fn passthrough(_args: TokenStream, item: TokenStream) -&gt; TokenStream {
    // Return the item unchanged — this macro does nothing
    item
}

// An attribute macro that adds a print statement before the function
#[proc_macro_attribute]
pub fn announce(_args: TokenStream, item: TokenStream) -&gt; TokenStream {
    // In a real macro, we'd parse item with syn and modify it.
    // For illustration, we return the item as-is.
    // A real implementation would prepend println!("Calling function...");
    item
}</code></pre>
</div>

<p>Usage in another crate:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// my-app/src/main.rs
use my_macros::passthrough;

#[passthrough]
fn add(a: i32, b: i32) -&gt; i32 {
    a + b
}

fn main() {
    println!("{}", add(3, 4)); // 7
}</code></pre>
</div>

<h2>The #[tokio::main] Attribute: A Real Example</h2>

<p>The <code>#[tokio::main]</code> attribute you used in Module 12 is an attribute macro. It transforms your async main function by wrapping it in a Tokio runtime. Here is a simplified conceptual view of what it does:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// What you write:
#[tokio::main]
async fn main() {
    println!("Hello, async!");
}

// What the attribute macro generates (conceptually):
fn main() {
    tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
        .unwrap()
        .block_on(async {
            println!("Hello, async!");
        });
}</code></pre>
</div>

<p>The macro takes your async main, extracts the body, and wraps it in the runtime setup code. This is exactly what attribute macros are designed for: replacing boilerplate that would otherwise appear in every file that uses async Tokio.</p>

<h2>Attribute Macros vs Derive Macros</h2>

<dl>
  <dt>Derive macros (<code>#[derive(Trait)]</code>)</dt>
  <dd>Add implementations <em>alongside</em> the original item. The original struct/enum remains untouched. New <code>impl</code> blocks are added.</dd>
  <dt>Attribute macros (<code>#[my_attr]</code>)</dt>
  <dd>Replace the entire item. The macro receives the item and returns whatever it wants. The original is gone unless the macro explicitly includes it in its output.</dd>
</dl>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Defining proc macros in the main application crate</h3>
<p>Procedural macros (including attribute macros) must be in their own crate with <code>proc-macro = true</code>. Defining them in your app crate causes a compile error.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BUG: this is in src/main.rs, not a proc-macro crate
use proc_macro::TokenStream;

#[proc_macro_attribute]
pub fn my_attr(_args: TokenStream, item: TokenStream) -&gt; TokenStream {
    // Error: proc-macro functions can only be in a proc-macro crate
    item
}</code></pre>
</div>

<p>Fix: create a separate crate with <code>[lib] proc-macro = true</code> in its Cargo.toml, and put the macro there.</p>

<h3>Mistake 2: Forgetting to re-export the original item</h3>
<p>If your attribute macro is supposed to preserve the function it decorates but forgets to include it in the output, the function disappears.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BUG: returns an empty TokenStream — the decorated function is gone
#[proc_macro_attribute]
pub fn log_calls(_args: TokenStream, _item: TokenStream) -&gt; TokenStream {
    TokenStream::new() // The function has been deleted!
}</code></pre>
</div>

<p>Fix: always include the original <code>item</code> in the output, either unchanged or modified as needed.</p>
`
  },

  'ch93': {
    moduleNum: 14,
    moduleTitle: 'Macros &amp; Metaprogramming',
    chNum: 93,
    title: 'Procedural Macros',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 14 &mdash; Chapter 93</span>
</div>
<h1>Procedural Macros</h1>

<p>Chapter 90 covered <em>declarative macros</em> (<code>macro_rules!</code>), which work by pattern matching on syntax. This chapter introduces <em>procedural macros</em>: macros written as Rust functions that receive and return streams of tokens. They are more powerful and flexible, but also more complex to write.</p>

<h2>Analogy: A Compiler Plugin</h2>

<p>Imagine a smart text editor plugin that, when you annotate a function with a special comment, automatically generates documentation stubs, error handling wrappers, and test scaffolding. The plugin reads your source code, understands its structure, and writes new code. A procedural macro does exactly this: it runs during compilation, reads the syntax of your code, and emits new syntax that the compiler then compiles alongside your original code.</p>

<h2>The Three Kinds of Procedural Macros</h2>

<dl>
  <dt>1. Function-like macros</dt>
  <dd>Called like function-style macros: <code>my_macro!(input)</code>. They receive a <code>TokenStream</code> and return a <code>TokenStream</code>.</dd>
  <dt>2. Derive macros</dt>
  <dd>Used as <code>#[derive(MyTrait)]</code>. They receive the struct or enum they are attached to and generate additional <code>impl</code> blocks.</dd>
  <dt>3. Attribute macros</dt>
  <dd>Used as <code>#[my_attribute]</code>. They receive the item they are attached to and replace it with their output.</dd>
</dl>

<h2>The TokenStream</h2>

<p>A <code>TokenStream</code> is a sequence of tokens: the raw building blocks of Rust source code. Identifiers, keywords, punctuation, literals, and groups (parentheses, brackets, braces) are all tokens.</p>

<p>When a proc macro receives input, it gets a <code>TokenStream</code> representing the source. It must return a <code>TokenStream</code> representing the code to emit. The compiler then compiles the returned tokens as if you had written them by hand.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// This source code:
let x = 2 + 3;

// As a stream of tokens, it is roughly:
// [Ident("let"), Ident("x"), Punct("="), Literal(2), Punct("+"), Literal(3), Punct(";")]</code></pre>
</div>

<h2>Required Crate Setup</h2>

<p>All three kinds of proc macros must live in a separate crate declared as a proc-macro crate. You cannot mix proc macros and regular library code in the same crate:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">toml</span>
  <pre><code class="language-toml"># Cargo.toml for the proc-macro crate
[package]
name = "my-macros"
version = "0.1.0"
edition = "2021"

[lib]
proc-macro = true  # This is what makes it a proc-macro crate

[dependencies]
syn   = { version = "2", features = ["full"] }  # for parsing Rust syntax
quote = "1"                                       # for generating Rust code</code></pre>
</div>

<h2>Function-Like Proc Macros</h2>

<p>A function-like proc macro is invoked with <code>!</code> like a regular macro. It is marked with <code>#[proc_macro]</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// In my-macros/src/lib.rs
use proc_macro::TokenStream;

#[proc_macro]
pub fn make_answer(_input: TokenStream) -&gt; TokenStream {
    // Return a token stream representing the literal 42
    "42".parse().unwrap()
}

// Usage in another crate:
// use my_macros::make_answer;
// let answer = make_answer!();
// println!("{}", answer); // 42</code></pre>
</div>

<h2>The syn and quote Crates</h2>

<p>Writing proc macros by manually constructing token streams is very tedious. Two crates from the community are the standard solution:</p>

<dl>
  <dt><code>syn</code></dt>
  <dd>Parses a <code>TokenStream</code> into a structured Abstract Syntax Tree (AST). For example, <code>syn::parse_macro_input!(input as syn::DeriveInput)</code> gives you a parsed struct/enum with typed fields you can inspect.</dd>
  <dt><code>quote</code></dt>
  <dd>Generates a <code>TokenStream</code> from a Rust-like template using the <code>quote!</code> macro. Interpolate variables with <code>#variable</code>. This is the inverse of <code>syn</code>.</dd>
</dl>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// A derive macro using syn and quote
use proc_macro::TokenStream;
use quote::quote;
use syn::{parse_macro_input, DeriveInput};

#[proc_macro_derive(HelloWorld)]
pub fn hello_world_derive(input: TokenStream) -&gt; TokenStream {
    // Parse the input into a syntax tree
    let ast = parse_macro_input!(input as DeriveInput);

    // Get the name of the struct or enum
    let name = &amp;ast.ident;

    // Generate the impl block using quote!
    let expanded = quote! {
        impl HelloWorld for #name {
            fn hello_world() {
                println!("Hello, World! I am {}", stringify!(#name));
            }
        }
    };

    // Convert back to a TokenStream for the compiler
    TokenStream::from(expanded)
}</code></pre>
</div>

<h2>Using the Derive Macro</h2>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// In the application crate:
use my_macros::HelloWorld;

trait HelloWorld {
    fn hello_world();
}

#[derive(HelloWorld)]
struct Pancakes;

#[derive(HelloWorld)]
struct Waffles;

fn main() {
    Pancakes::hello_world(); // Hello, World! I am Pancakes
    Waffles::hello_world();  // Hello, World! I am Waffles
}</code></pre>
</div>

<pre class="output"><code>Hello, World! I am Pancakes
Hello, World! I am Waffles</code></pre>

<h2>Workspace Layout for Proc Macros</h2>

<p>The typical project structure when using proc macros:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">bash</span>
  <pre><code class="language-bash">my-project/
├── Cargo.toml          # workspace definition
├── my-macros/
│   ├── Cargo.toml      # proc-macro = true
│   └── src/
│       └── lib.rs      # macro definitions
└── my-app/
    ├── Cargo.toml      # depends on my-macros
    └── src/
        └── main.rs     # uses the macros</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">toml</span>
  <pre><code class="language-toml"># Root Cargo.toml (workspace)
[workspace]
members = ["my-macros", "my-app"]

# my-app/Cargo.toml
[dependencies]
my-macros = { path = "../my-macros" }</code></pre>
</div>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Putting proc macros and regular code in the same crate</h3>
<p>A crate with <code>proc-macro = true</code> can only export proc macros. You cannot also export regular functions or types from it.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BUG: in a proc-macro crate, you can't also export regular functions
#[proc_macro_derive(MyTrait)]
pub fn my_trait_derive(input: TokenStream) -&gt; TokenStream { /* ... */ }

// This will not be visible to users of the crate:
pub fn helper_function() -&gt; i32 { 42 } // silently invisible</code></pre>
</div>

<p>Fix: put helper code in a separate regular crate. Your proc-macro crate depends on the helper crate, and so does your app crate.</p>

<h3>Mistake 2: Panicking in a proc macro with an unhelpful error</h3>
<p>If your proc macro panics with a generic message, the compiler shows a confusing error pointing to the macro invocation site. Use <code>syn::Error</code> to emit proper compiler error messages with accurate spans.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BAD: generic panic gives a confusing compiler error
panic!("Only structs are supported");

// GOOD: syn::Error points to the exact token that caused the problem
return syn::Error::new(ast.span(), "Only structs are supported")
    .to_compile_error()
    .into();</code></pre>
</div>
`
  },

  'ch94': {
    moduleNum: 14,
    moduleTitle: 'Macros &amp; Metaprogramming',
    chNum: 94,
    title: 'Building Custom Derive',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 14 &mdash; Chapter 94</span>
</div>
<h1>Building Custom Derive</h1>

<p>This chapter walks through building a complete, working custom derive macro from scratch. You will create a proc-macro crate, parse the input with <code>syn</code>, generate code with <code>quote</code>, and use the derive in another crate. By the end, you will have a working end-to-end example of the full proc-macro workflow.</p>

<h2>Analogy: The Automatic Form-Filler</h2>

<p>Your company needs all employee records to have an "employee card" printout. The HR system reads each employee record (the struct definition), finds the relevant fields (name, department, ID), and automatically generates the formatted card. A custom derive macro does the same: it reads your struct's field names and types at compile time and generates the trait implementation code automatically.</p>

<h2>What We Are Building</h2>

<p>We will build a <code>#[derive(Summary)]</code> macro for this trait:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">pub trait Summary {
    fn summarize(&amp;self) -&gt; String;
}</code></pre>
</div>

<p>For any struct that derives <code>Summary</code>, the macro will generate an implementation that returns a string listing all the struct's field names and values:</p>

<pre class="output"><code>Article { title: "Rust is Great", author: "Alice" }</code></pre>

<h2>Step 1: Create the Workspace</h2>

<p>Set up a workspace with two crates: the proc-macro crate and the application crate.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">bash</span>
  <pre><code class="language-bash">cargo new summary-project --lib   # root workspace
cargo new summary-derive --lib    # proc-macro crate
cargo new summary-app             # application crate</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">toml</span>
  <pre><code class="language-toml"># Root Cargo.toml
[workspace]
members = ["summary-derive", "summary-app"]</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">toml</span>
  <pre><code class="language-toml"># summary-derive/Cargo.toml
[package]
name = "summary-derive"
version = "0.1.0"
edition = "2021"

[lib]
proc-macro = true

[dependencies]
syn   = { version = "2", features = ["full"] }
quote = "1"</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">toml</span>
  <pre><code class="language-toml"># summary-app/Cargo.toml
[dependencies]
summary-derive = { path = "../summary-derive" }</code></pre>
</div>

<h2>Step 2: Write the Derive Macro</h2>

<p>The macro implementation lives in <code>summary-derive/src/lib.rs</code>. Here is the complete code with detailed comments:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// summary-derive/src/lib.rs
use proc_macro::TokenStream;
use quote::quote;
use syn::{parse_macro_input, Data, DeriveInput, Fields};

#[proc_macro_derive(Summary)]
pub fn summary_derive(input: TokenStream) -&gt; TokenStream {
    // Step 1: Parse the input TokenStream into a structured AST
    let ast = parse_macro_input!(input as DeriveInput);

    // Step 2: Extract the name of the struct/enum
    let name = &amp;ast.ident; // e.g., "Article"

    // Step 3: Extract the field names to include in the summary
    let fields = match &amp;ast.data {
        Data::Struct(data) =&gt; match &amp;data.fields {
            Fields::Named(named) =&gt; named.named.iter()
                .map(|f| f.ident.as_ref().unwrap())
                .collect::&lt;Vec&lt;_&gt;&gt;(),
            _ =&gt; panic!("Summary only supports structs with named fields"),
        },
        _ =&gt; panic!("Summary only supports structs"),
    };

    // Step 4: Build the format string and field values dynamically
    // For fields [title, author], we want:
    // format!("Article {{ title: {:?}, author: {:?} }}", self.title, self.author)
    let field_names: Vec&lt;String&gt; = fields.iter()
        .map(|f| f.to_string())
        .collect();

    let format_str = format!(
        "{} {{ {} }}",
        name,
        field_names.iter()
            .map(|f| format!("{}: {{:?}}", f))
            .collect::&lt;Vec&lt;_&gt;&gt;()
            .join(", ")
    );

    // Step 5: Generate the impl block with quote!
    let expanded = quote! {
        impl Summary for #name {
            fn summarize(&amp;self) -&gt; String {
                format!(#format_str, #(self.#fields),*)
            }
        }
    };

    // Step 6: Convert back to a TokenStream
    TokenStream::from(expanded)
}</code></pre>
</div>

<h2>Step 3: Use the Derive in the App</h2>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// summary-app/src/main.rs
use summary_derive::Summary;

// Define the trait that the macro implements
pub trait Summary {
    fn summarize(&amp;self) -&gt; String;
}

#[derive(Summary)]
struct Article {
    title: String,
    author: String,
    views: u32,
}

#[derive(Summary)]
struct Tweet {
    username: String,
    content: String,
}

fn main() {
    let article = Article {
        title: String::from("Rust is Amazing"),
        author: String::from("Alice"),
        views: 1500,
    };

    let tweet = Tweet {
        username: String::from("rustacean"),
        content: String::from("Just learned proc macros!"),
    };

    println!("{}", article.summarize());
    println!("{}", tweet.summarize());
}</code></pre>
</div>

<pre class="output"><code>Article { title: "Rust is Amazing", author: "Alice", views: 1500 }
Tweet { username: "rustacean", content: "Just learned proc macros!" }</code></pre>

<p>The derive macro generated the <code>summarize()</code> implementation for both structs automatically, using the actual field names and types from each struct's definition.</p>

<h2>Understanding the quote! Interpolation</h2>

<p>The <code>quote!</code> macro uses <code>#variable</code> to interpolate Rust values into the generated token stream. A few special forms to know:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use quote::quote;

let name = syn::Ident::new("MyStruct", proc_macro2::Span::call_site());
let value: i32 = 42;

// Basic interpolation
let _code = quote! {
    struct #name {
        count: i32,
    }
};

// Repetition with #(...)* — expands each item in a Vec
let field_names = vec![
    syn::Ident::new("x", proc_macro2::Span::call_site()),
    syn::Ident::new("y", proc_macro2::Span::call_site()),
];

let _code2 = quote! {
    fn sum(&amp;self) -&gt; i32 {
        0 #(+ self.#field_names)*
    }
};
// Generates: fn sum(&self) -> i32 { 0 + self.x + self.y }</code></pre>
</div>

<h2>Adding Helper Attributes</h2>

<p>Custom derives can also support <em>helper attributes</em>: extra attributes on fields that the macro reads to customize its behavior. Declare them with <code>#[proc_macro_derive(MyMacro, attributes(my_attr))]</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Declare helper attributes in the macro crate:
#[proc_macro_derive(Summary, attributes(skip))]
pub fn summary_derive(input: TokenStream) -&gt; TokenStream {
    let ast = parse_macro_input!(input as DeriveInput);
    // Now fields can be annotated with #[skip] and the macro can detect it
    // by checking field.attrs for the "skip" attribute
    let _name = &amp;ast.ident;
    // ... rest of implementation
    TokenStream::new()
}

// Usage: skip a field from the summary
#[derive(Summary)]
struct Article {
    title: String,
    #[skip]          // this field is excluded from summarize()
    internal_id: u64,
}</code></pre>
</div>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Calling parse_macro_input! outside a proc_macro function</h3>
<p><code>parse_macro_input!</code> can only be called at the top level of a <code>#[proc_macro*]</code> function, not inside helpers.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BUG: parse_macro_input! in a helper function
fn parse_helper(input: TokenStream) -&gt; DeriveInput {
    parse_macro_input!(input as DeriveInput) // compile error
}

// FIXED: parse at the proc_macro entry point, pass the AST to helpers
#[proc_macro_derive(MyTrait)]
pub fn my_trait_derive(input: TokenStream) -&gt; TokenStream {
    let ast = parse_macro_input!(input as DeriveInput); // OK here
    impl_my_trait(&amp;ast)
}

fn impl_my_trait(ast: &amp;DeriveInput) -&gt; TokenStream {
    // work with ast here
    TokenStream::new()
}</code></pre>
</div>

<h3>Mistake 2: Forgetting to handle enums and tuple structs</h3>
<p>If your derive macro only handles named-field structs and a user applies it to an enum or tuple struct, the <code>panic!</code> gives a confusing error. Handle all cases explicitly.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BAD: panic with a generic message
let fields = match &amp;ast.data {
    Data::Struct(s) =&gt; &amp;s.fields,
    _ =&gt; panic!("not a struct"), // vague error
};</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// GOOD: use syn::Error for a proper compiler diagnostic
let fields = match &amp;ast.data {
    Data::Struct(data) =&gt; &amp;data.fields,
    _ =&gt; {
        return syn::Error::new_spanned(
            &amp;ast.ident,
            "Summary can only be derived for structs"
        )
        .to_compile_error()
        .into();
    }
};</code></pre>
</div>

<h3>Mistake 3: Not adding the derive crate to Cargo.toml</h3>
<p>The proc-macro crate must be listed as a dependency in the crate that uses the derive. Forgetting it causes "use of undeclared crate or module" errors.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">toml</span>
  <pre><code class="language-toml"># summary-app/Cargo.toml — must explicitly depend on the macro crate
[dependencies]
summary-derive = { path = "../summary-derive" }  # required!</code></pre>
</div>
`
  }
});
