/* ================================================================
   Module 4: Ownership & Borrowing — The Foundation
   Chapters: 18 - 26  (this file covers ch18, ch19, ch20)
   ================================================================ */
Object.assign(CHAPTERS_CONTENT, {

  /* ---------------------------------------------------------------
     Chapter 18: Stack vs Heap
     --------------------------------------------------------------- */
  'ch18': {
    moduleNum: 4,
    moduleTitle: 'Ownership & Borrowing',
    chNum: 18,
    title: 'Stack vs Heap',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 4 &mdash; Chapter 18</span>
</div>

<h1>Stack vs Heap</h1>

<p>Before you can understand ownership, you need to understand where data lives in memory. Every program you write uses two regions of memory: the <strong>stack</strong> and the <strong>heap</strong>. These are not abstract concepts. They are two physically distinct areas of RAM that your program uses in fundamentally different ways, and the distinction between them is the reason Rust's ownership system is designed the way it is.</p>

<p>This chapter will give you a concrete mental model of both regions. Everything in Modules 4 and 5 builds on top of what you learn here.</p>

<h2>What is Memory?</h2>

<p>When your program runs, the operating system gives it a chunk of RAM to use. Inside that RAM, your program organizes data into different regions. The two most important regions for a Rust programmer are the stack and the heap.</p>

<p>Think of your program's memory as a building with two storage areas: a small, perfectly organized filing cabinet (the stack) and a large, flexible warehouse with a manager who keeps track of where everything is stored (the heap). Both exist in the same building (RAM), but they work very differently.</p>

<h2>The Stack</h2>

<h3>The Cafeteria Tray Analogy</h3>

<p>Picture a cafeteria where customers stack trays on top of each other. The kitchen adds trays to the top. Customers take trays from the top. You can only interact with the topmost tray. This is called LIFO: Last In, First Out. The tray that was put on last is the first one taken off.</p>

<p>The stack in memory works exactly the same way. When a function is called, it pushes its data onto the top of the stack. When the function returns, its data is popped off. Data always enters and leaves from the top. This mechanical simplicity is what makes the stack so fast.</p>

<p>The one strict rule of the stack is: <strong>the size of data must be known at compile time.</strong> The compiler needs to know exactly how many bytes to allocate before the program runs. Types like <code>i32</code> (always 4 bytes), <code>f64</code> (always 8 bytes), and <code>bool</code> (always 1 byte) satisfy this rule perfectly. They are always stack-allocated.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    // All of these live on the stack.
    // Their sizes are known at compile time.
    let a: i32  = 42;         // always 4 bytes
    let b: f64  = 3.14159;    // always 8 bytes
    let c: bool = true;       // always 1 byte
    let d: char = 'Z';        // always 4 bytes (Unicode scalar)

    println!("a={} b={} c={} d={}", a, b, c, d);
} // a, b, c, d are all popped off the stack here automatically</code></pre>
</div>

<pre class="output"><code>a=42 b=3.14159 c=true d=Z</code></pre>

<p>When <code>main</code> returns, the stack frame is simply discarded. No cleanup code runs. The stack pointer moves back, and that memory is immediately available for the next function. This is why stack access is extremely fast.</p>

<div class="callout">
  <div class="callout-label">Key Property of Stack Data</div>
  <p>All stack data has a size that is fixed and known at compile time. The compiler literally writes the exact byte offset for each variable into the machine code before your program ever starts.</p>
</div>

<h3>Visualizing the Stack</h3>

<p>Here is how the stack grows and shrinks as functions are called:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn add(x: i32, y: i32) -&gt; i32 {
    let result = x + y;  // result is pushed onto the stack
    result               // returned, stack frame for add() is popped
}

fn main() {
    let a = 10;   // pushed onto stack
    let b = 20;   // pushed onto stack
    let c = add(a, b); // add() gets its own stack frame above main's
    println!("c = {}", c);
} // a, b, c all popped off the stack</code></pre>
</div>

<pre class="output"><code>c = 30</code></pre>

<p>When <code>add</code> is called, it gets its own <em>stack frame</em> placed on top of <code>main</code>'s frame. When <code>add</code> returns, its frame is immediately discarded. Main's frame is still there, untouched.</p>

<h2>The Heap</h2>

<h3>The Coat Check Analogy</h3>

<p>Picture a coat check at a theater. You walk in with a coat of any size. The attendant takes it, finds an open rack somewhere in the back room (you don't care where), hangs it up, and gives you a small ticket (a pointer) with a number. When you want your coat back, you hand over the ticket and the attendant fetches it for you.</p>

<p>The heap is that back room. The heap allocator (the attendant) finds a free block of memory large enough for your data, reserves it, and gives your program a pointer to that location. The key difference from the stack: the data can be any size, and that size can change while the program runs.</p>

<p>This flexibility comes at a cost. The allocator must search for free space, track what is allocated and what is free, and eventually release the memory when you are done. All of this bookkeeping takes time, making heap allocation slower than stack allocation.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    // String lives on the HEAP.
    // Its size can grow and shrink at runtime.
    let mut s = String::from("hello");

    s.push_str(", world!"); // String grows on the heap

    println!("{}", s);
} // When s goes out of scope, Rust frees the heap memory automatically</code></pre>
</div>

<pre class="output"><code>hello, world!</code></pre>

<p>The variable <code>s</code> on the stack holds three values: a pointer to the heap data, a length (how many bytes are in use), and a capacity (how many bytes are reserved). The actual string content lives on the heap. When you call <code>push_str</code>, the heap data grows, and the length and capacity on the stack are updated.</p>

<div class="callout">
  <div class="callout-label">String vs &str</div>
  <p>There are two string types in Rust. A <code>&amp;str</code> (string slice) is a reference to string data baked into the program binary at compile time. It is fixed-size and does not live on the heap. A <code>String</code> is a heap-allocated, growable string. When you need to build, modify, or own a string, use <code>String</code>. When you just need to read a fixed piece of text, use <code>&amp;str</code>.</p>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let s1: &amp;str   = "hello";         // &amp;str: embedded in binary, fixed
    let s2: String = String::from("hello"); // String: on the heap, dynamic

    println!("s1 = {}", s1);
    println!("s2 = {}", s2);

    // s2 can be modified; s1 cannot
    let mut s3 = String::from("good");
    s3.push_str("bye");
    println!("s3 = {}", s3);
}</code></pre>
</div>

<pre class="output"><code>s1 = hello
s2 = hello
s3 = goodbye</code></pre>

<h2>What Lives Where: The Rule</h2>

<p>The rule is simple and applies universally in Rust:</p>

<dl>
  <dt>Stack: size known at compile time</dt>
  <dd>All primitive types (i8, i16, i32, i64, i128, isize, u8, u16, u32, u64, u128, usize, f32, f64, bool, char), fixed-size arrays ([T; N]), tuples made entirely of stack types.</dd>
  <dt>Heap: size unknown or variable at compile time</dt>
  <dd>String, Vec&lt;T&gt;, HashMap&lt;K, V&gt;, Box&lt;T&gt;, and any other type that can grow or shrink.</dd>
</dl>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::mem;

fn main() {
    // Stack types: all have fixed sizes
    println!("i32    = {} bytes", mem::size_of::&lt;i32&gt;());
    println!("f64    = {} bytes", mem::size_of::&lt;f64&gt;());
    println!("bool   = {} bytes", mem::size_of::&lt;bool&gt;());
    println!("char   = {} bytes", mem::size_of::&lt;char&gt;());

    // String itself is a fixed-size struct on the stack:
    // pointer (8 bytes) + length (8 bytes) + capacity (8 bytes) = 24 bytes
    // But the CONTENT lives on the heap and can be any size.
    println!("String = {} bytes (stack part only)", mem::size_of::&lt;String&gt;());
}</code></pre>
</div>

<pre class="output"><code>i32    = 4 bytes
f64    = 8 bytes
bool   = 1 bytes
char   = 4 bytes
String = 24 bytes (stack part only)</code></pre>

<p>The <code>String</code> struct is always 24 bytes on the stack (on a 64-bit system), regardless of how many characters it holds. That 24-byte struct is a fixed-size "header" that points into heap memory where the actual characters live. The heap portion's size can be any number of bytes.</p>

<h2>The Vec Story</h2>

<p>The heap analogy becomes very clear with a <code>Vec&lt;T&gt;</code> (a growable array). Like <code>String</code>, a <code>Vec</code> stores its metadata on the stack and its elements on the heap:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let mut v: Vec&lt;i32&gt; = Vec::new(); // empty vec, no heap allocation yet

    v.push(10); // heap allocation begins, capacity reserved
    v.push(20);
    v.push(30);

    println!("Length:   {}", v.len());      // 3 elements stored
    println!("Capacity: {}", v.capacity()); // could be 4 (Rust may reserve extra)

    for n in &amp;v {
        println!("{}", n);
    }
} // when v goes out of scope, heap memory is freed</code></pre>
</div>

<pre class="output"><code>Length:   3
Capacity: 4
10
20
30</code></pre>

<p>The <code>Vec</code>'s three-field stack struct (pointer, length, capacity) occupies the same space regardless of whether it holds 0 or 1,000,000 elements. Only the heap region grows.</p>

<h2>Why This Distinction Drives Rust's Design</h2>

<p>Stack data is simple: when the scope ends, the data is gone. No cleanup needed. But heap data has a problem that every systems language must solve: <strong>who is responsible for freeing the heap memory?</strong></p>

<ul>
  <li>In C and C++, the programmer manually calls <code>free()</code> or <code>delete</code>. Forget to call it: memory leak. Call it twice: undefined behavior. Call it too early: use-after-free bug.</li>
  <li>In Java, Python, and Go, a garbage collector runs periodically to find and free unreachable memory. This is safe but adds runtime overhead and pauses.</li>
  <li>In Rust, ownership solves this at compile time: the compiler tracks who owns heap data and automatically inserts the cleanup code exactly once, exactly when the owner goes out of scope. No manual memory management. No garbage collector. No overhead.</li>
</ul>

<p>This is why understanding stack vs heap is the essential first step. The ownership chapters that follow are the compiler's answer to the heap management problem.</p>

<div class="callout">
  <div class="callout-label">The Takeaway</div>
  <p>Stack: fast, automatic, fixed-size data. Heap: flexible, dynamic-size data that requires careful management. Rust's ownership system exists specifically to manage heap memory safely and efficiently, without a garbage collector and without manual memory management errors.</p>
</div>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Thinking String Literals and Strings Are the Same Thing</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: trying to push to a &amp;str
fn main() {
    let mut s = "hello"; // s is &amp;str, not String
    s.push_str(" world"); // error: no method named 'push_str' on &amp;str
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: use String for a mutable, growable string
fn main() {
    let mut s = String::from("hello");
    s.push_str(" world");
    println!("{}", s);
}</code></pre>
</div>

<h3>Mistake 2: Expecting Heap Memory to Be Freed Manually</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// UNNECESSARY: you do not need to (and cannot) manually free in Rust
fn main() {
    let s = String::from("hello");
    println!("{}", s);
    // No need to call free(s) or delete s
    // Rust frees it automatically when s goes out of scope
}</code></pre>
</div>

<p>Coming from C or C++, you might instinctively look for a <code>free()</code> call. Rust does not have one for normal memory. The compiler inserts the cleanup automatically based on ownership rules. Trying to free memory manually in Rust is not possible with safe code, which eliminates the double-free and use-after-free bugs that plague C programs.</p>

<h3>Mistake 3: Assuming All Struct Data Lives on the Stack</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// The struct variable is on the stack,
// but any String or Vec fields live on the heap.
struct User {
    username: String,   // heap
    score: u32,         // stack (inside the struct)
}

fn main() {
    let user = User {
        username: String::from("alice"), // heap allocation
        score: 100,
    };
    println!("{}: {}", user.username, user.score);
}</code></pre>
</div>

<p>The <code>User</code> struct's value sits on the stack, but the <code>username</code> field is a <code>String</code> whose character data is on the heap. The struct's stack representation just holds a pointer to that heap data.</p>
`
  },


  /* ---------------------------------------------------------------
     Chapter 19: Move Semantics
     --------------------------------------------------------------- */
  'ch19': {
    moduleNum: 4,
    moduleTitle: 'Ownership & Borrowing',
    chNum: 19,
    title: 'Move Semantics',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 4 &mdash; Chapter 19</span>
</div>

<h1>Move Semantics</h1>

<p>In the previous chapter you learned that heap data requires careful management: exactly one piece of code must be responsible for freeing it. Rust enforces this by giving every piece of heap data exactly one <strong>owner</strong>. When you assign a heap value to another variable, you do not copy it. You <strong>move</strong> it. The original variable becomes empty and is no longer usable.</p>

<p>This single rule eliminates an entire class of memory bugs. This chapter explains what moving is, why it happens, and how to work with it.</p>

<h2>The Physical Book Analogy</h2>

<p>Imagine you have a physical book. There is only one copy. If you give the book to a friend, you no longer have it. Your friend now has it. You cannot read from your own copy because you do not have one anymore. If both of you tried to claim ownership of the same book and both tried to "return it to the library" (free the memory), chaos would ensue.</p>

<p>This is exactly how heap data works in Rust. When you assign a <code>String</code> or a <code>Vec</code> to another variable, it is like handing that book to someone else. The original variable is invalidated. Only one party holds the resource at any given time.</p>

<h2>Assignment Moves Heap Data</h2>

<p>For types whose data lives on the heap, assignment transfers ownership rather than copying:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let s1 = String::from("hello");
    let s2 = s1; // ownership of the heap data moves from s1 to s2

    // s1 is now invalid. The compiler has "poisoned" it.
    println!("{}", s2); // works
}</code></pre>
</div>

<pre class="output"><code>hello</code></pre>

<p>What exactly happened? Before the assignment, <code>s1</code> held a pointer, a length, and a capacity on the stack, pointing to heap memory containing "hello". After <code>let s2 = s1</code>, Rust copied those three stack values into <code>s2</code> and immediately invalidated <code>s1</code>. The heap memory was not duplicated. Only the pointer was copied, and Rust ensures only one variable holds a valid pointer to that memory at any time.</p>

<div class="callout">
  <div class="callout-label">Why Not Just Copy the Heap Data Too?</div>
  <p>Copying heap data (called a "deep copy") is expensive. It means allocating new heap memory and copying every byte. Rust never silently performs expensive operations. If you want a deep copy, you must explicitly ask for it with <code>.clone()</code>. This makes performance characteristics visible and predictable.</p>
</div>

<h2>Using a Moved Variable Is a Compile Error</h2>

<p>If you try to use a variable after its value has been moved, the compiler refuses to build the program. This is one of the most common errors Rust beginners encounter, and it is always caught at compile time, never at runtime:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let s1 = String::from("hello");
    let s2 = s1;              // s1 is moved to s2

    println!("{}", s1);       // ERROR: value borrowed here after move
    println!("{}", s2);       // OK: s2 is the owner
}</code></pre>
</div>

<pre class="output"><code>error[E0382]: borrow of moved value: \`s1\`
 --> src/main.rs:5:20
  |
2 |     let s1 = String::from("hello");
  |         -- move occurs because \`s1\` has type \`String\`
3 |     let s2 = s1;
  |              -- value moved here
5 |     println!("{}", s1);
  |                    ^^ value borrowed here after move</code></pre>

<p>The error message is precise. It tells you exactly where the move happened (line 3) and where you tried to use the invalidated variable (line 5). Rust's compiler errors on ownership are designed to teach you where the problem is, not just that there is a problem.</p>

<h2>Clone: Asking for a Deep Copy Explicitly</h2>

<h3>The Photocopier Analogy</h3>

<p>If you want to keep your book and also give a copy to a friend, you use a photocopier. Both of you have a full, independent copy. The friend can write in their copy without affecting yours. You can modify yours without affecting theirs. Each copy is completely independent.</p>

<p>In Rust, <code>.clone()</code> is the photocopier. It performs a deep copy of heap data, allocating new heap memory and duplicating all the content:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let s1 = String::from("hello");
    let s2 = s1.clone(); // deep copy: new heap allocation, all data duplicated

    println!("s1 = {}", s1); // still valid
    println!("s2 = {}", s2); // also valid, completely independent copy
}</code></pre>
</div>

<pre class="output"><code>s1 = hello
s2 = hello</code></pre>

<p>After <code>.clone()</code>, both <code>s1</code> and <code>s2</code> are valid owners of their own independent heap allocations. Modifying one will not affect the other. Both will be freed independently when each goes out of scope.</p>

<div class="callout">
  <div class="callout-label">Clone Has a Cost</div>
  <p>Calling <code>.clone()</code> on a large <code>String</code> or <code>Vec</code> allocates heap memory and copies every byte. This is intentionally visible. If you see <code>.clone()</code> in Rust code, you know: "this is doing a potentially expensive allocation." If you see no <code>.clone()</code>, you know: "no hidden copying is happening." This predictability is part of what makes Rust fast.</p>
</div>

<h2>Copy Types: No Move, Just Copy</h2>

<h3>The Phone Number Analogy</h3>

<p>Now imagine telling someone your phone number. You still have it. They also have it. Sharing your phone number does not deprive you of it. There is no "moving" of phone numbers because they are cheap and trivial to duplicate. The same logic applies to simple numeric data.</p>

<p>Types whose data lives entirely on the stack use <strong>Copy semantics</strong> instead of Move semantics. When you assign a Copy type to another variable, the value is bit-for-bit duplicated on the stack. Both variables are valid. Neither is "moved":</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let x = 5;    // i32 implements Copy
    let y = x;    // x is COPIED, not moved

    // Both x and y are valid. Neither is invalidated.
    println!("x = {}", x);
    println!("y = {}", y);

    let a = true; // bool implements Copy
    let b = a;    // copied
    println!("a = {}, b = {}", a, b);

    let c = 3.14; // f64 implements Copy
    let d = c;    // copied
    println!("c = {}, d = {}", c, d);
}</code></pre>
</div>

<pre class="output"><code>x = 5
y = 5
a = true, b = true
c = 3.14, d = 3.14</code></pre>

<p>Types that implement <code>Copy</code> include: all integer types (<code>i8</code> through <code>i128</code>, <code>u8</code> through <code>u128</code>, <code>isize</code>, <code>usize</code>), floating-point types (<code>f32</code>, <code>f64</code>), <code>bool</code>, <code>char</code>, and tuples or arrays composed entirely of <code>Copy</code> types.</p>

<p>Types that do NOT implement <code>Copy</code> include: <code>String</code>, <code>Vec&lt;T&gt;</code>, and any type that owns heap memory.</p>

<h2>Functions and Move Semantics</h2>

<h3>The Library Book Return Analogy</h3>

<p>Passing a value to a function is identical to assigning it to a new variable. If you pass a heap type to a function, the function takes ownership. The function is now holding the book. When the function ends, the book is gone unless the function explicitly returns it.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn consume(s: String) {  // s takes ownership of the String
    println!("I own: {}", s);
} // s goes out of scope here. Memory is freed.

fn main() {
    let my_string = String::from("hello");
    consume(my_string);  // ownership is moved into the function

    // my_string is now invalid!
    // println!("{}", my_string); // ERROR: value borrowed after move
}</code></pre>
</div>

<pre class="output"><code>I own: hello</code></pre>

<p>After calling <code>consume(my_string)</code>, the variable <code>my_string</code> is moved. The function owns the data. When the function returns, its stack frame is cleaned up, and the <code>String</code>'s heap memory is freed. <code>my_string</code> in <code>main</code> is now invalid.</p>

<h2>Copy Types in Functions: No Problem</h2>

<p>Passing a <code>Copy</code> type to a function copies the value, leaving the original intact. This is completely painless and requires no special thought:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn print_number(n: i32) {  // n is a COPY of the passed value
    println!("number is: {}", n);
} // n goes out of scope, but this only pops a stack value

fn main() {
    let x = 42;
    print_number(x);  // x is COPIED into n, not moved

    println!("x is still valid: {}", x); // works fine
}</code></pre>
</div>

<pre class="output"><code>number is: 42
x is still valid: 42</code></pre>

<h2>Moving Out of a Function: Returning Ownership</h2>

<p>A function can give ownership back to its caller by returning the value. This transfers the ownership chain from the function back up to whoever called it:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn create_greeting(name: &amp;str) -&gt; String {
    let greeting = format!("Hello, {}!", name); // creates a String on the heap
    greeting  // ownership of this String is returned to the caller
}

fn main() {
    let g = create_greeting("Alice"); // g takes ownership of the returned String
    println!("{}", g);
} // g goes out of scope, String is freed</code></pre>
</div>

<pre class="output"><code>Hello, Alice!</code></pre>

<h2>The Problem with Moving In and Out of Functions</h2>

<p>You might have noticed a frustrating pattern: to use a <code>String</code> in a function and still use it afterward, you would have to move it in and then return it back out. This is verbose and awkward:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn get_length(s: String) -&gt; (String, usize) {
    let len = s.len();
    (s, len)  // must return s back to the caller to keep it alive!
}

fn main() {
    let s = String::from("hello world");
    let (s, len) = get_length(s); // get s back via tuple
    println!("'{}' has {} characters", s, len);
}</code></pre>
</div>

<pre class="output"><code>'hello world' has 11 characters</code></pre>

<p>This works but is clearly tedious. Having to return the original value just to keep using it after a function call is not practical for real programs. The solution to this problem is <strong>references and borrowing</strong>, which you will learn in Chapter 21. References let you pass data to a function without moving ownership, so the caller can still use the data afterward.</p>

<div class="callout">
  <div class="callout-label">The Pattern So Far</div>
  <p>Heap data: one owner at a time. Assignment and function calls move ownership. Moving makes the original invalid. Use <code>.clone()</code> for an explicit deep copy. Stack/Copy types never move; they are always copied. Returning a value from a function transfers ownership to the caller. References (coming next) let you avoid these moves.</p>
</div>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Using a Variable After Moving It</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN
fn main() {
    let v = vec![1, 2, 3];
    let w = v;          // v is moved to w
    println!("{:?}", v); // error: use of moved value: 'v'
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED option 1: use w instead
fn main() {
    let v = vec![1, 2, 3];
    let w = v;
    println!("{:?}", w); // use the new owner
}

// FIXED option 2: clone if you need both
fn main() {
    let v = vec![1, 2, 3];
    let w = v.clone(); // deep copy
    println!("v={:?}, w={:?}", v, w);
}</code></pre>
</div>

<h3>Mistake 2: Expecting to Use a String After Passing It to a Function</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN
fn print_message(msg: String) {
    println!("{}", msg);
}

fn main() {
    let message = String::from("hello");
    print_message(message);
    println!("{}", message); // error: value borrowed here after move
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED option 1: clone before passing
fn main() {
    let message = String::from("hello");
    print_message(message.clone());
    println!("{}", message); // original still valid

}

// FIXED option 2: use a reference (covered in Chapter 21)
fn print_message_ref(msg: &amp;str) {
    println!("{}", msg);
}

fn main() {
    let message = String::from("hello");
    print_message_ref(&amp;message); // borrow, not move
    println!("{}", message);     // still valid
}</code></pre>
</div>

<h3>Mistake 3: Assuming All Assignment Creates Independent Copies</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// INCORRECT MENTAL MODEL
fn main() {
    let s1 = String::from("hello");
    let s2 = s1; // NOT a copy — this is a MOVE
    // s1 is now invalid. Only s2 owns the data.
    // If you expected s1 to still be "hello", you have the wrong model.
}

// This IS a copy because i32 implements Copy
fn main() {
    let x = 5;
    let y = x; // COPY — both x and y are 5, both valid
}</code></pre>
</div>

<p>The key question to ask when you see <code>let b = a;</code> is: does <code>a</code>'s type own heap data? If yes, it is a move. If no (stack/Copy type), it is a copy.</p>
`
  },


  /* ---------------------------------------------------------------
     Chapter 20: Ownership Rules
     --------------------------------------------------------------- */
  'ch20': {
    moduleNum: 4,
    moduleTitle: 'Ownership & Borrowing',
    chNum: 20,
    title: 'Ownership Rules',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 4 &mdash; Chapter 20</span>
</div>

<h1>Ownership Rules</h1>

<p>The previous two chapters built your intuition: stack data is simple and automatic, heap data needs careful management, and Rust uses "move semantics" to track who owns heap data. Now it is time to look at the formal rules that govern all of this behavior.</p>

<p>Rust's entire memory safety guarantee rests on three rules. These rules are simple to state. The compiler enforces them at compile time. Understanding them deeply will make every ownership-related error message make sense.</p>

<h2>The Three Ownership Rules</h2>

<div class="callout">
  <div class="callout-label">The Three Rules of Ownership</div>
  <p>
    1. Each value in Rust has exactly one <strong>owner</strong>.<br>
    2. There can only be one owner at a time.<br>
    3. When the owner goes out of scope, the value is <strong>dropped</strong>.
  </p>
</div>

<p>These three rules work together as a system. Rule 1 and Rule 2 together prevent double-free bugs (two things trying to free the same memory). Rule 3 guarantees that all memory is eventually freed, with no leaks. The compiler checks all three rules for every value in every program, without any runtime cost.</p>

<h2>Rule 1 and 2: Each Value Has Exactly One Owner</h2>

<h3>The Car Title Analogy</h3>

<p>Think of a car and its title document. The title is the legal proof of ownership. At any point in time, exactly one person holds the title. When you sell the car, you transfer the title. The previous owner no longer has any legal claim to the car. They cannot sell it, drive it legally, or demand it back. Only the title holder can exercise ownership rights.</p>

<p>A Rust value works exactly the same way. There is always exactly one variable that "holds the title" for any heap value. When that variable is assigned to another (or passed to a function), the title transfers. The original variable's title is revoked.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    // s1 is the owner. Rule 1: one owner.
    let s1 = String::from("hello");

    // Ownership transfers from s1 to s2. Rule 2: only one owner at a time.
    let s2 = s1;

    // s1 no longer owns anything. s2 is the sole owner.
    println!("{}", s2); // works
    // println!("{}", s1); // compile error: s1 is no longer the owner
}</code></pre>
</div>

<pre class="output"><code>hello</code></pre>

<p>There is never a moment where both <code>s1</code> and <code>s2</code> own the same data. The transfer is instantaneous and tracked by the compiler. This is what prevents the double-free memory bug.</p>

<h2>Rule 3: Scope and Drop</h2>

<h3>The Library Book Analogy</h3>

<p>When you borrow a library book, the library does not wait indefinitely for you to return it. There is a due date. When the due date passes, the book is considered returned and can be lent to someone else. You cannot renew it or access it after the due date.</p>

<p>A variable's <em>scope</em> is its due date. A scope is the region of code between the curly braces <code>{}</code> that contains the variable. When program execution reaches the closing <code>}</code> of that scope, every variable declared within it goes "out of scope" and is immediately dropped.</p>

<p>For heap data, "dropped" means its heap memory is freed. For stack data, it means the stack space is reclaimed. Rust inserts this cleanup code automatically, based purely on scope:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let x = 5; // x is in scope here (stack value)

    {
        let s = String::from("hello"); // s is in scope here (heap value)
        println!("inner scope: s = {}", s);
    } // &lt;-- s goes out of scope. Rust drops it. Heap memory freed here.

    // s is gone. You cannot use it here.
    println!("outer scope: x = {}", x); // x is still valid

    // println!("{}", s); // error: cannot find value 's' in this scope
} // x goes out of scope here. Stack space is reclaimed.</code></pre>
</div>

<pre class="output"><code>inner scope: s = hello
outer scope: x = 5</code></pre>

<p>The cleanup of <code>s</code> happens exactly at the closing <code>}</code> of the inner block. Not earlier (the value is still accessible before that point), not later (no waiting, no garbage collection). Exactly at scope exit.</p>

<h2>Visualizing Scope with Multiple Variables</h2>

<p>Let us walk through a more detailed example, watching each variable's lifetime:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {                         // outer scope begins
    let s1 = String::from("one");   // s1 valid from here

    {                               // inner scope begins
        let s2 = String::from("two"); // s2 valid from here
        let s3 = String::from("three"); // s3 valid from here

        println!("s1={}, s2={}, s3={}", s1, s2, s3);
    }                               // s3 dropped FIRST, then s2 dropped
                                    // (reverse order of declaration)

    println!("s1={}", s1);          // s1 still valid
    // s2 and s3 are gone here
} // s1 dropped last</code></pre>
</div>

<pre class="output"><code>s1=one, s2=two, s3=three
s1=one</code></pre>

<p>Variables within a scope are dropped in <strong>reverse order of declaration</strong>. This is deliberate: a variable declared later may depend on a variable declared earlier. Dropping the later one first ensures no dangling dependencies.</p>

<h2>What Does "Drop" Mean Exactly?</h2>

<h3>The Hotel Checkout Analogy</h3>

<p>When you check out of a hotel room, the hotel staff comes in, cleans the room, and makes it ready for the next guest. You handed back the key (the resource), and the hotel handles all the cleanup. You do not need to do anything beyond checking out.</p>

<p>Rust's <code>drop</code> mechanism is the hotel staff. When a value goes out of scope, Rust automatically calls a special function called <code>drop</code> on it. For a <code>String</code>, <code>drop</code> frees the heap memory that held the string data. For a <code>Vec</code>, <code>drop</code> frees the heap memory that held the elements. For a file handle, <code>drop</code> closes the file. For a network connection, <code>drop</code> closes the socket.</p>

<p>This pattern, where resource management is tied to the lifetime of an object, is called <strong>RAII</strong> (Resource Acquisition Is Initialization). It originated in C++ and is one of the most powerful patterns in systems programming. Rust makes it automatic and enforced:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// You can see drop in action by implementing it yourself
struct ImportantResource {
    name: String,
}

impl Drop for ImportantResource {
    fn drop(&amp;mut self) {
        println!("Dropping resource: {}", self.name);
    }
}

fn main() {
    let r1 = ImportantResource { name: String::from("DatabaseConnection") };
    {
        let r2 = ImportantResource { name: String::from("FileHandle") };
        println!("Inside inner scope");
    } // r2 is dropped here: "Dropping resource: FileHandle"
    println!("Back in outer scope");
} // r1 is dropped here: "Dropping resource: DatabaseConnection"</code></pre>
</div>

<pre class="output"><code>Inside inner scope
Dropping resource: FileHandle
Back in outer scope
Dropping resource: DatabaseConnection</code></pre>

<p>You can see exactly when each resource is cleaned up. This deterministic cleanup is a major advantage over garbage-collected languages where you cannot know exactly when (or in what order) resources are reclaimed.</p>

<h2>Ownership and Functions: The Full Picture</h2>

<p>Passing a value to a function and returning a value from a function both follow the same ownership rules as assignment. Let us see all three transfer directions together:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// This function takes ownership of a String and returns a different String
fn transform(input: String) -&gt; String {
    println!("Received: {}", input);
    // input is dropped here if we don't return it or something else
    String::from("transformed") // new String returned to caller
}

// This function takes ownership and does NOT return it
fn consume(s: String) {
    println!("Consuming: {}", s);
} // s is dropped here

fn main() {
    let s1 = String::from("original");

    // s1 is moved into transform. The returned value is bound to s2.
    let s2 = transform(s1);
    // s1 is no longer valid here.

    println!("Transformed: {}", s2);

    // s2 is moved into consume. Nothing is returned.
    consume(s2);
    // s2 is no longer valid here.
} // nothing left to drop at this point</code></pre>
</div>

<pre class="output"><code>Received: original
Transformed: transformed
Consuming: transformed</code></pre>

<h2>Ownership Transfer via Return</h2>

<h3>The Hot Potato Analogy</h3>

<p>Think of ownership like a game of hot potato. At any instant, exactly one player holds the potato. Tossing it to another player immediately transfers ownership. The thrower no longer has it. When a function "returns" a value, it is tossing the potato back to the caller. The caller now holds it and is responsible for it.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn give_a_string() -&gt; String {
    let s = String::from("mine now yours"); // s is created, owned by this function
    s // ownership transferred to the caller by returning
} // if s weren't returned, it would be dropped here

fn take_and_give_back(s: String) -&gt; String {
    // s comes in from caller (they gave us ownership)
    println!("Working with: {}", s);
    s // ownership given back to caller
}

fn main() {
    let s1 = give_a_string();          // s1 takes ownership of the returned value
    println!("Got: {}", s1);

    let s2 = take_and_give_back(s1);   // s1 moved in, returned as s2
    println!("Back: {}", s2);
    // s1 is no longer valid, s2 is the owner now
} // s2 is dropped here</code></pre>
</div>

<pre class="output"><code>Got: mine now yours
Working with: mine now yours
Back: mine now yours</code></pre>

<h2>Why These Rules Make Programs Correct</h2>

<p>Without these rules, programs can have two categories of memory bugs:</p>

<dl>
  <dt>Use-after-free</dt>
  <dd>Reading or writing to memory that has already been freed. This leads to crashes or silent data corruption. In Rust, Rule 3 guarantees values are dropped exactly once, and after dropping, the variable is invalidated, so you cannot access freed memory.</dd>
  <dt>Double-free</dt>
  <dd>Calling the cleanup code twice on the same memory. This corrupts the allocator's internal data structures and causes crashes. In Rust, Rules 1 and 2 guarantee only one variable owns any piece of heap data, so the cleanup runs exactly once.</dd>
</dl>

<p>Both bugs are impossible in safe Rust. The three ownership rules make them literally unrepresentable at the type level.</p>

<div class="callout">
  <div class="callout-label">The Borrow Checker</div>
  <p>The compiler component that enforces these three rules is called the <strong>borrow checker</strong>. It analyzes every variable's lifetime and ownership at compile time. If you violate any ownership rule, the borrow checker rejects your program with a specific, helpful error message explaining which rule was violated and where. There is no runtime ownership tracking and no garbage collector. The safety guarantee is entirely compile-time.</p>
</div>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Expecting a Variable to Survive Past Its Scope</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN
fn main() {
    {
        let greeting = String::from("hello");
    } // greeting is dropped here

    println!("{}", greeting); // error: cannot find value 'greeting'
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: declare the variable in the scope where you need it
fn main() {
    let greeting = String::from("hello"); // declared in outer scope

    {
        println!("Inner: {}", greeting); // can access from outer scope
    }

    println!("Outer: {}", greeting); // still valid
}</code></pre>
</div>

<h3>Mistake 2: Trying to Have Two Owners of the Same Heap Value</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: attempting to use both s1 and s2 after move
fn main() {
    let s1 = String::from("hello");
    let s2 = s1;  // ownership moved to s2

    // Both of these cannot work simultaneously:
    println!("{}", s1); // error: s1 was moved
    println!("{}", s2); // this would work but s1 above prevents compilation
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: use clone to have two independent owners
fn main() {
    let s1 = String::from("hello");
    let s2 = s1.clone();  // deep copy: s2 gets its own heap allocation

    println!("{}", s1); // valid: s1 still owns original
    println!("{}", s2); // valid: s2 owns its own copy
}</code></pre>
</div>

<h3>Mistake 3: Forgetting That Function Parameters Take Ownership</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: function takes ownership, caller cannot use it after
fn length(s: String) -&gt; usize {
    s.len()
} // s is dropped here

fn main() {
    let text = String::from("hello world");
    let len = length(text);

    // text was moved into length(). It no longer exists here.
    println!("{} has {} characters", text, len); // error: value borrowed after move
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: take a reference instead (will be covered in Chapter 21)
fn length(s: &amp;String) -&gt; usize {
    s.len()  // borrows s, does not take ownership
}

fn main() {
    let text = String::from("hello world");
    let len = length(&amp;text); // lend text to the function

    // text is still valid: we only lent it
    println!("{} has {} characters", text, len);
}</code></pre>
</div>
`
  },

});
