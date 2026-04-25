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

  /* ---------------------------------------------------------------
     Chapter 21: References
     --------------------------------------------------------------- */
  'ch21': {
    moduleNum: 4,
    moduleTitle: 'Ownership & Borrowing',
    chNum: 21,
    title: 'References',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 4 &mdash; Chapter 21</span>
</div>

<h1>References</h1>

<p>In Chapter 20, you learned that every value in Rust has exactly one owner, and that passing a value to a function moves ownership into that function. Once moved, the original variable is no longer usable. This chapter introduces <strong>references</strong>: Rust's mechanism for accessing a value without taking ownership of it.</p>

<p>References are arguably the most important concept in Rust. Nearly every piece of real Rust code uses them. Understanding references clearly is what separates programmers who fight the borrow checker from those who work with it naturally.</p>

<h2>The Reading Room Analogy</h2>

<p>Imagine a special archive library that holds rare, one-of-a-kind manuscripts. The rule is firm: no manuscript can ever leave the building. Visitors sit in a reading room and can read any manuscript they choose. Multiple visitors can read the same manuscript at the same time. When a visitor leaves, the manuscript stays. The library retains possession at all times.</p>

<p>Rust references work the same way. The <em>owner</em> is the library. A <em>reference</em> is a visitor sitting in the reading room. The visitor can read the data, but when the visit ends, the data stays with the library (the owner). The visitor never possessed it permanently.</p>

<p>The act of creating a reference is called <strong>borrowing</strong>. You are borrowing access to the value, not taking it.</p>

<h2>Creating a Reference: The &amp; Operator</h2>

<p>You create a reference by placing <code>&amp;</code> in front of an expression. The result is a reference to that value. The type of a reference to a <code>String</code> is written <code>&amp;String</code>. The type of a reference to an <code>i32</code> is written <code>&amp;i32</code>.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let s1 = String::from("hello");

    // &amp;s1 creates a reference to s1.
    // s1 still owns the data. r only borrows it.
    let r = &amp;s1;

    // Both s1 and r can be used to read the data.
    println!("s1 = {}", s1);  // s1 is the owner, still valid
    println!("r  = {}", r);   // r is the borrower, can also read it
} // r drops here (freeing the reference, not the data).
  // Then s1 drops, freeing the String's heap memory.</code></pre>
</div>

<pre class="output"><code>s1 = hello
r  = hello</code></pre>

<p>Both <code>s1</code> and <code>r</code> print <code>"hello"</code>, but only <code>s1</code> <em>owns</em> the data. <code>r</code> is just a pointer to <code>s1</code>'s data. When <code>r</code> drops, nothing is freed (references do not own anything). Only when <code>s1</code> drops is the heap memory freed. The owner is always responsible for cleanup, not the borrowers.</p>

<div class="callout">
  <div class="callout-label">A Safe Pointer</div>
  <p>A reference is similar to a pointer in C or C++, but with one critical guarantee: Rust's compiler ensures a reference <em>always</em> points to a valid, live value for the entire time it exists. You cannot create a reference that points to freed or invalid memory. This guarantee is enforced entirely at compile time, with no runtime overhead.</p>
</div>

<h2>References as Function Parameters: Borrowing Without Moving</h2>

<h3>The Problem Before References</h3>

<p>From Chapter 20, getting a String's length while keeping the String alive required a verbose workaround: move the String into the function, compute the result, and return the String back out so the caller can keep using it.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Without references: must return the String back to keep it alive
fn get_length_clunky(s: String) -&gt; (String, usize) {
    let len = s.len();
    (s, len)  // return s back so the caller does not lose it
}

fn main() {
    let s = String::from("hello");
    let (s, len) = get_length_clunky(s);
    println!("'{}' has length {}", s, len);
}</code></pre>
</div>

<pre class="output"><code>'hello' has length 5</code></pre>

<p>This works but is awkward. Imagine needing to call five different functions on the same String: you would have to thread it through every return value. References provide a clean solution.</p>

<h3>The Solution: Pass a Reference</h3>

<p>Change the parameter type from <code>String</code> to <code>&amp;String</code>. The function borrows the data instead of taking ownership. It can read and use the data, and when it returns, the caller's String is still fully owned and valid.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn calculate_length(s: &amp;String) -&gt; usize {
    s.len()
} // s (the reference) drops here. The String it points to is NOT freed.

fn main() {
    let s1 = String::from("hello");

    // Pass &amp;s1: lend the String, do not give it away.
    let len = calculate_length(&amp;s1);

    // s1 is still valid. We only lent it.
    println!("The length of '{}' is {}.", s1, len);
}</code></pre>
</div>

<pre class="output"><code>The length of 'hello' is 5.</code></pre>

<p>The two changes are small but important: the function signature uses <code>&amp;String</code> (a reference to a String) instead of <code>String</code>, and the call site passes <code>&amp;s1</code> (a reference to s1) instead of <code>s1</code>. The function no longer returns the String back. The caller never lost ownership. Use this pattern whenever a function only needs to read data.</p>

<h2>What Immutable Borrowing Cannot Do: No Modification</h2>

<p>The references created with <code>&amp;</code> are called <strong>immutable references</strong>. Just as a library visitor can read a manuscript but cannot write in the margins, an immutable reference gives read-only access. Attempting to modify data through an immutable reference is a compile-time error:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// This does NOT compile.
fn try_to_modify(s: &amp;String) {
    s.push_str(", world");
    // Compile error: cannot borrow through an immutable reference.
    // push_str requires mutable access, but s is &amp;String, not &amp;mut String.
}</code></pre>
</div>

<p>To modify data through a reference, you need a <strong>mutable reference</strong>, written <code>&amp;mut String</code>. Mutable references have strict rules and are the subject of Chapter 22.</p>

<div class="callout">
  <div class="callout-label">Why Immutable by Default?</div>
  <p>If multiple parts of your code hold references to the same data, allowing any of them to modify it silently would be dangerous for all the others. Immutable references are safe in unlimited quantities because read-only access creates no conflicts. Mutability is an explicit opt-in, not the default, because safe reads are far more common than safe writes.</p>
</div>

<h2>Multiple Immutable References: All Are Welcome</h2>

<p>Because immutable references cannot change the data, any number of them can exist simultaneously. This is like a dozen visitors reading the same book in the reading room at once. No one is writing anything, so no one conflicts with anyone else.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn print_it(label: &amp;str, value: &amp;String) {
    println!("{}: {}", label, value);
}

fn main() {
    let data = String::from("Rust references");

    // Three immutable references to the same data: all valid simultaneously.
    let r1 = &amp;data;
    let r2 = &amp;data;
    let r3 = &amp;data;

    println!("r1 = {}", r1);
    println!("r2 = {}", r2);
    println!("r3 = {}", r3);

    // Multiple function calls borrowing the same value are also fine.
    print_it("First call",  &amp;data);
    print_it("Second call", &amp;data);

    // The original data variable is untouched throughout.
    println!("Original: {}", data);
}</code></pre>
</div>

<pre class="output"><code>r1 = Rust references
r2 = Rust references
r3 = Rust references
First call: Rust references
Second call: Rust references
Original: Rust references</code></pre>

<p>All three references and both function calls read from <code>data</code> safely and at the same time. None of them owns <code>data</code>. None of them can change it. When each goes out of scope, nothing is freed. Only when <code>data</code> itself goes out of scope is the String's heap memory freed.</p>

<h2>Dereferencing: The * Operator</h2>

<p>A reference is an address. It tells you <em>where</em> a value lives in memory, not what the value is. The <strong>dereference operator</strong> <code>*</code> follows the address to retrieve the value stored there.</p>

<p>Think of a reference as a note with a locker number written on it. The note is not the treasure inside the locker. The <code>*</code> operator is the act of going to that locker and opening it to get the contents.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let x: i32   = 99;
    let r: &amp;i32  = &amp;x;   // r is a reference (an address) pointing to x

    println!("x   = {}", x);    // the original value: 99
    println!("r   = {}", r);    // Rust auto-derefs in println!: 99
    println!("*r  = {}", *r);   // explicit dereference: 99

    // Dereferenced values work in arithmetic and comparisons:
    let doubled = *r * 2;
    println!("doubled = {}", doubled);  // 198

    assert!(*r == x);    // true
    assert!(*r == 99);   // true
}</code></pre>
</div>

<pre class="output"><code>x   = 99
r   = 99
*r  = 99
doubled = 198</code></pre>

<div class="callout">
  <div class="callout-label">Auto-Deref: You Rarely Need * in Practice</div>
  <p>Rust automatically dereferences references in most contexts: method calls, <code>println!</code> format arguments, equality comparisons, and arithmetic. This is called <em>auto-deref</em>. For ordinary <code>&amp;T</code> references in everyday code, you will rarely need to write <code>*</code> explicitly. Explicit <code>*</code> becomes relevant with smart pointers (<code>Box</code>, <code>Rc</code>, etc.) and with mutable references when assigning through them.</p>
</div>

<h2>The Scope of a Borrow: When Does It End?</h2>

<p>A borrow is active from where the reference is created to the point it is <em>last used</em>. This is subtler than it sounds. The borrow does not necessarily last until the closing curly brace of the surrounding block. Modern Rust uses a feature called <strong>Non-Lexical Lifetimes (NLL)</strong>: the compiler tracks the exact last usage of each reference, not just block boundaries.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let mut s = String::from("hello");

    let r1 = &amp;s;
    let r2 = &amp;s;
    println!("r1 = {}, r2 = {}", r1, r2);
    // r1 and r2 are last used on the line above.
    // Their borrows end here (NLL). No active references remain.

    // s can now be modified because no references to it are active.
    s.push_str(" world");
    println!("s = {}", s);
}</code></pre>
</div>

<pre class="output"><code>r1 = hello, r2 = hello
s = hello world</code></pre>

<p>The borrow checker sees that <code>r1</code> and <code>r2</code> are last used in the first <code>println!</code>. After that line, the compiler considers those borrows finished. So calling <code>s.push_str</code> is allowed: the readers left before the writer arrived. If you tried to use <code>r1</code> after the <code>push_str</code> call, the compiler would reject it.</p>

<h2>A Reference Does Not Own: No Memory Is Freed</h2>

<p>When a reference variable goes out of scope, <strong>no heap memory is freed</strong>. References do not own data, so they have nothing to clean up. Only the owner frees memory when it drops. This distinction is foundational.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn char_count(text: &amp;String) -&gt; usize {
    text.len()
}  // text (the reference) drops here. Nothing is freed.

fn word_count(text: &amp;String) -&gt; usize {
    text.split_whitespace().count()
}  // text (the reference) drops here. Nothing is freed.

fn main() {
    let sentence = String::from("Rust makes memory safe");

    // Lend sentence to both functions. Neither takes ownership.
    let chars = char_count(&amp;sentence);
    let words = word_count(&amp;sentence);

    // sentence is still fully alive and valid here.
    println!("'{}': {} chars, {} words", sentence, chars, words);
}  // sentence drops here. The heap memory is freed at this point.</code></pre>
</div>

<pre class="output"><code>'Rust makes memory safe': 22 chars, 4 words</code></pre>

<p>Both functions borrow <code>sentence</code>, do their computation, and return. Neither frees anything when it ends because neither owns anything. The String lives for the entire duration of <code>main</code> and is freed exactly when <code>sentence</code>'s scope ends. This is deterministic and requires no garbage collector.</p>

<h2>The Two Rules of References</h2>

<p>All of Rust's borrow checking traces back to two rules. Every borrow checker error you will ever see violates one of them:</p>

<dl>
  <dt>Rule 1: At any given time, you may have either one mutable reference OR any number of immutable references, but not both simultaneously.</dt>
  <dd>Multiple readers are safe to coexist. One exclusive writer is safe. A writer coexisting with any reader creates a data race and is forbidden. Rust enforces this at compile time.</dd>
  <dt>Rule 2: References must always be valid.</dt>
  <dd>A reference must always point to live, valid data. Rust will not allow a reference to outlive the value it refers to. Dangling pointers are impossible.</dd>
</dl>

<div class="callout">
  <div class="callout-label">Two Rules, Zero Runtime Cost</div>
  <p>These rules eliminate data races (Rule 1) and dangling pointers (Rule 2) at compile time. There is no runtime check, no garbage collector pause, no performance overhead. The safety is the compiler's work, done before your program ever runs. You get systems-level performance with memory safety that languages like C and C++ cannot provide.</p>
</div>

<p>This chapter covered immutable references and the "any number of immutable references" part of Rule 1, along with Rule 2 in its basic form. Chapter 22 covers mutable references and the one-mutable-reference restriction. Chapter 23 explores dangling references and how Rust prevents Rule 2 violations.</p>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Forgetting &amp; at the Call Site When a Function Expects a Reference</h3>

<p>The most common beginner error: the function signature correctly uses <code>&amp;String</code>, but the call site passes the value directly without <code>&amp;</code>. Without <code>&amp;</code>, Rust tries to move the value, which the type system rejects because the function expected a reference.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN
fn display(s: &amp;String) {
    println!("{}", s);
}

fn main() {
    let msg = String::from("hello");
    display(msg);  // error: expected &amp;String, found String
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: add &amp; at the call site
fn display(s: &amp;String) {
    println!("{}", s);
}

fn main() {
    let msg = String::from("hello");
    display(&amp;msg);        // pass a reference, not the value
    println!("{}", msg);  // msg is still valid after the call
}</code></pre>
</div>

<h3>Mistake 2: Creating a Mutable Reference to a Non-Mutable Variable</h3>

<p>A mutable reference (<code>&amp;mut T</code>) requires the original variable to be declared with <code>mut</code>. If the variable itself is immutable, no reference can mutate it. The binding and the reference mutability must agree.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN
fn main() {
    let x = 5;          // x is NOT declared as mut
    let r = &amp;mut x;     // error: x was not declared as mut
    *r = 10;
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: declare the variable with mut
fn main() {
    let mut x = 5;      // mut allows mutable references
    let r = &amp;mut x;     // mutable reference is now valid
    *r = 10;
    println!("x = {}", x); // x = 10
}</code></pre>
</div>

<h3>Mistake 3: Using T as the Type Annotation When the Variable Holds &amp;T</h3>

<p>When a variable stores a reference, its type annotation must include <code>&amp;</code>. Writing <code>i32</code> when you mean <code>&amp;i32</code> is a type mismatch: the value on the right side of the assignment is a reference, but the annotation declares the variable as a plain integer.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN
fn main() {
    let x: i32 = 10;
    let r: i32 = &amp;x;  // error: expected i32, found &amp;i32
    println!("{}", r);
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: the type must match what &amp;x produces
fn main() {
    let x: i32   = 10;
    let r: &amp;i32  = &amp;x;   // &amp;i32 matches the &amp;x on the right
    println!("explicit: {}", *r); // dereference manually
    println!("auto:     {}", r);  // auto-deref by println!
}</code></pre>
</div>
`
  },

  /* ---------------------------------------------------------------
     Chapter 22: Mutable vs Immutable Borrow
     --------------------------------------------------------------- */
  'ch22': {
    moduleNum: 4,
    moduleTitle: 'Ownership & Borrowing',
    chNum: 22,
    title: 'Mutable vs Immutable Borrow',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 4 &mdash; Chapter 22</span>
</div>

<h1>Mutable vs Immutable Borrow</h1>

<p>In Chapter 21, you learned about immutable references: lending read-only access to a value to multiple readers at once. But what if you need a function to <em>modify</em> the data it receives, without taking ownership? That is what <strong>mutable references</strong> are for, written as <code>&amp;mut T</code>. They come with one critical restriction that immutable references do not have: only one mutable reference to a given value can exist at any point in time, and no other references of any kind may coexist with it.</p>

<p>This chapter explains mutable borrowing, why the rules around it exist, and how Non-Lexical Lifetimes make those rules less painful in practice.</p>

<h2>The Whiteboard Analogy</h2>

<p>Picture a shared whiteboard in an office meeting room. Multiple colleagues can stand around the whiteboard and read what is on it simultaneously. That is safe: everyone is just reading. But suppose one person needs to erase and rewrite a section. While they are mid-edit, the board is in an inconsistent state. If another person is reading that section right now, they might see half-erased, incoherent content. And if two people try to erase and rewrite different parts at the same time, the result is chaos.</p>

<p>Rust enforces the whiteboard rule: unlimited readers (<code>&amp;T</code>) can coexist, but a writer (<code>&amp;mut T</code>) requires exclusive access. No other readers. No other writers. The writer's turn is uninterruptible.</p>

<h2>Creating a Mutable Reference</h2>

<p>To create a mutable reference, two things must be true: the binding that owns the data must be declared <code>mut</code>, and you use <code>&amp;mut</code> instead of <code>&amp;</code> to create the reference.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let mut s = String::from("hello"); // STEP 1: owner must be mut

    let r = &amp;mut s;  // STEP 2: use &amp;mut to create a mutable reference
    r.push_str(", world");

    println!("{}", s); // hello, world
}</code></pre>
</div>

<pre class="output"><code>hello, world</code></pre>

<p>Both steps are required. If you declare <code>let s = ...</code> without <code>mut</code>, Rust will refuse to let you create <code>&amp;mut s</code>. An immutable binding signals that the value should never change; Rust honours that signal by blocking all mutation paths, including mutable references.</p>

<h2>Mutable References as Function Parameters</h2>

<p>The most common use of mutable references is in function parameters. Instead of the function taking ownership and returning the modified value, it receives a mutable reference, modifies the data in place, and returns nothing special. The caller sees the change immediately after the call returns.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn append_exclamation(s: &amp;mut String) {
    s.push('!');
}

fn double_number(n: &amp;mut i32) {
    *n *= 2;
}

fn main() {
    let mut greeting = String::from("Hello");
    append_exclamation(&amp;mut greeting);
    println!("{}", greeting); // Hello!

    let mut count = 7;
    double_number(&amp;mut count);
    println!("{}", count); // 14
}</code></pre>
</div>

<pre class="output"><code>Hello!
14</code></pre>

<p>The function signature uses <code>&amp;mut String</code> and the call site passes <code>&amp;mut greeting</code>. Both must agree. Notice <code>*n *= 2</code> in <code>double_number</code>: when you want to assign through a mutable reference to a primitive, you must dereference with <code>*</code> to reach the actual value. Method calls like <code>push</code> handle this automatically.</p>

<h2>The Exclusivity Rule: One Mutable Reference at a Time</h2>

<p>You cannot create two mutable references to the same value that are both active at the same time. This is a compile-time error:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// This does NOT compile.
fn main() {
    let mut s = String::from("hello");

    let r1 = &amp;mut s;
    let r2 = &amp;mut s; // error: cannot borrow s as mutable more than once

    println!("{}, {}", r1, r2);
}</code></pre>
</div>

<p>If both <code>r1</code> and <code>r2</code> could write to <code>s</code> at the same time, their writes would race against each other and produce unpredictable results. This is the definition of a data race. Rust eliminates the possibility entirely at compile time.</p>

<h3>Sequential Mutable References Are Fine</h3>

<p>The restriction is about <em>simultaneous</em> active borrows. If one mutable reference ends before the next one begins, there is no conflict. You can use scopes to enforce this explicitly:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let mut s = String::from("hello");

    {
        let r1 = &amp;mut s;
        r1.push_str(" first");
    } // r1 goes out of scope here. Mutable borrow ends.

    // Safe to create a new mutable reference.
    let r2 = &amp;mut s;
    r2.push_str(" second");

    println!("{}", s); // hello first second
}</code></pre>
</div>

<pre class="output"><code>hello first second</code></pre>

<p>NLL (Non-Lexical Lifetimes) also makes this work without explicit scopes, as long as the first mutable reference is not used after the point where the second one is created. The compiler tracks the last actual use, not the closing brace.</p>

<h2>Mixing Mutable and Immutable References Is Forbidden</h2>

<p>You cannot have an immutable reference and a mutable reference to the same value at the same time. The logic is the same: if one piece of code is reading and another is writing simultaneously, the reader might see a partially-modified, inconsistent state.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// This does NOT compile.
fn main() {
    let mut s = String::from("hello");

    let r1 = &amp;s;       // immutable borrow
    let r2 = &amp;s;       // another immutable borrow — fine so far
    let r3 = &amp;mut s;   // error: mutable borrow while immutable borrows exist

    println!("{}, {}, {}", r1, r2, r3);
}</code></pre>
</div>

<h3>NLL: Borrows End at Last Use, Not at Closing Brace</h3>

<p>Thanks to Non-Lexical Lifetimes, if the immutable references are used and then <em>never used again</em>, the compiler considers their borrows finished at that last use. A mutable reference created after that point is safe:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let mut s = String::from("hello");

    let r1 = &amp;s;
    let r2 = &amp;s;
    println!("readers: {} and {}", r1, r2);
    // r1 and r2 are last used above. Their borrows end here (NLL).

    // No active immutable borrows remain, so a mutable borrow is allowed.
    let r3 = &amp;mut s;
    r3.push_str(" world");
    println!("writer: {}", r3);
}</code></pre>
</div>

<pre class="output"><code>readers: hello and hello
writer: hello world</code></pre>

<div class="callout">
  <div class="callout-label">The Complete Reference Rules</div>
  <p>At any given time, a value may have <em>either</em> one mutable reference (<code>&amp;mut T</code>) <em>or</em> any number of immutable references (<code>&amp;T</code>), but never both simultaneously. References must always point to valid data. These two rules together prevent data races and dangling pointers at compile time with no runtime cost.</p>
</div>

<h2>Why These Rules Prevent Data Races</h2>

<p>A data race requires three conditions: two or more code paths access the same memory; at least one is writing; and there is no synchronisation between them. Data races cause undefined behaviour — crashes, corrupted data, and security holes.</p>

<p>Rust's mutable reference rules make the third condition impossible: because only one writer can ever exist at a time, and no readers can coexist with it, there is never a scenario where an unsynchronised write races against a read. The safety is guaranteed before a single line of your code executes.</p>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Two Mutable References in the Same Scope</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN
fn main() {
    let mut data = String::from("hello");
    let a = &amp;mut data;
    let b = &amp;mut data; // error: cannot borrow data as mutable more than once
    println!("{} {}", a, b);
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: use scopes so borrows do not overlap
fn main() {
    let mut data = String::from("hello");
    {
        let a = &amp;mut data;
        a.push_str("_A");
    } // a's borrow ends here
    let b = &amp;mut data;
    b.push_str("_B");
    println!("{}", data); // hello_A_B
}</code></pre>
</div>

<h3>Mistake 2: Calling a Mutating Method While a Reference Exists</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN
fn main() {
    let mut v = vec![1, 2, 3];
    let first = &amp;v[0];        // immutable borrow of v
    v.push(4);                 // error: mutable borrow while immutable borrow exists
    println!("first is {}", first);
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: let the immutable borrow end before mutating
fn main() {
    let mut v = vec![1, 2, 3];
    println!("first is {}", v[0]); // use v[0] directly; no stored reference
    v.push(4);
    println!("v is {:?}", v); // [1, 2, 3, 4]
}</code></pre>
</div>

<h3>Mistake 3: Passing &amp;x Instead of &amp;mut x to a Function That Needs &amp;mut</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN
fn triple(n: &amp;mut i32) { *n *= 3; }

fn main() {
    let mut x = 4;
    triple(&amp;x);  // error: expected &amp;mut i32, found &amp;i32
    println!("{}", x);
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: pass &amp;mut x
fn triple(n: &amp;mut i32) { *n *= 3; }

fn main() {
    let mut x = 4;
    triple(&amp;mut x);
    println!("{}", x); // 12
}</code></pre>
</div>
`
  },

  /* ---------------------------------------------------------------
     Chapter 23: Dangling References
     --------------------------------------------------------------- */
  'ch23': {
    moduleNum: 4,
    moduleTitle: 'Ownership & Borrowing',
    chNum: 23,
    title: 'Dangling References',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 4 &mdash; Chapter 23</span>
</div>

<h1>Dangling References</h1>

<p>In Chapter 21, the second rule of references stated: <em>references must always be valid</em>. A <strong>dangling reference</strong> is a reference that points to memory that has already been freed. Dangling references are one of the most dangerous bugs in C and C++. In Rust, they are impossible: the compiler detects and rejects every situation that would produce one.</p>

<p>This chapter shows exactly what dangling references are, why they are dangerous, and how Rust's borrow checker stops them.</p>

<h2>The Demolished Building Analogy</h2>

<p>Imagine you write down the address of an office building on a sticky note so you can visit it later. While you are on your way there, a demolition crew tears the building down. You arrive at the address, but there is nothing there: just an empty lot. Your sticky note has an address that is no longer valid. Following it leads you somewhere that no longer makes sense.</p>

<p>A dangling pointer is that sticky note. It holds an address in memory that used to contain data, but the data has since been freed. Following that address in your program reads garbage values or crashes. Rust's compiler tracks the lifetimes of all your data and refuses to compile any code that could produce such a sticky note.</p>

<h2>The Classic Dangling Reference: Returning a Reference to a Local Variable</h2>

<p>The most common way to accidentally create a dangling reference is to return a reference to a variable that was created inside a function. When the function ends, its local variables are dropped. A reference to them would then point to freed memory:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// This does NOT compile.
fn dangle() -&gt; &amp;String {
    let s = String::from("hello");
    &amp;s  // We return a reference to s...
} // ...but s is dropped HERE. The reference would point to freed memory.

fn main() {
    let reference_to_nothing = dangle();
}</code></pre>
</div>

<p>When you try to compile this, Rust gives a lifetime error. The key part of the error message explains: the function returns a reference, but the data that reference points to will be dropped when the function returns. There is no living value to borrow from.</p>

<div class="callout">
  <div class="callout-label">What the Error Is Telling You</div>
  <p>Rust's error for this case mentions <em>lifetimes</em>. A lifetime is the compiler's way of tracking how long a value lives. The compiler sees that <code>s</code> lives only for the duration of the function, but the returned reference would need to live longer (in the caller's scope). These lifetimes are incompatible. Lifetimes are covered thoroughly in Module 5.</p>
</div>

<h2>The Fix: Return Owned Data Instead of a Reference</h2>

<p>If you want to return string data from a function, return a <code>String</code> (an owned value) instead of a <code>&amp;String</code> (a reference). Ownership transfers to the caller, and the data lives on safely:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: return the owned String, not a reference to it
fn no_dangle() -&gt; String {
    let s = String::from("hello");
    s  // Ownership of s moves to the caller. No dangling possible.
}

fn main() {
    let s = no_dangle();
    println!("{}", s); // hello
}</code></pre>
</div>

<pre class="output"><code>hello</code></pre>

<p>When you return <code>s</code> (not <code>&amp;s</code>), ownership moves out of the function into the caller. The data is not freed when the function ends; the caller now owns it and its lifetime extends accordingly.</p>

<h2>Valid References: Returning Input Data</h2>

<p>You <em>can</em> return a reference from a function, as long as that reference refers to data that was passed <em>into</em> the function and therefore lives in the caller's scope. The key insight is that the reference's lifetime is tied to the input data, not to the function's own local variables:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// VALID: the returned reference refers to the input, which lives in the caller
fn longest_word&lt;'a&gt;(sentence: &amp;'a str) -&gt; &amp;'a str {
    let words: Vec&lt;&amp;str&gt; = sentence.split_whitespace().collect();
    let mut best = "";
    for w in &amp;words {
        if w.len() &gt; best.len() {
            best = w;
        }
    }
    best
}

fn main() {
    let sentence = String::from("the quick brown fox");
    let word = longest_word(&amp;sentence);
    println!("Longest: {}", word); // quick
}</code></pre>
</div>

<pre class="output"><code>Longest: quick</code></pre>

<p>The function returns a reference to a slice of <code>sentence</code>. Since <code>sentence</code> lives in <code>main</code> and the returned reference points into it, the reference's lifetime is valid. When <code>main</code> is done, both <code>sentence</code> and <code>word</code> go out of scope together. No dangling possible. The <code>'a</code> notation is a lifetime annotation, covered fully in Module 5.</p>

<h2>What Would Happen If Rust Allowed Dangling References</h2>

<p>To understand why this matters, consider what dangling references cause in languages that allow them:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// This is HYPOTHETICAL. Rust refuses to compile it.
// In C, this is valid code and causes undefined behaviour.
//
// fn get_value() -&gt; &amp;i32 {
//     let x = 42;
//     &amp;x          // x is freed when this function returns
// }
//
// fn main() {
//     let r = get_value(); // r points to freed stack memory
//     println!("{}", *r);  // undefined: could print 42, garbage, or crash
// }</code></pre>
</div>

<p>In C and C++, this code compiles and runs. The pointer <code>r</code> points to a stack slot that was part of <code>get_value</code>'s frame. After the function returns, that stack slot is reused by whatever gets called next. Reading from <code>r</code> after that reads whatever garbage was written there by the next function. This class of bug causes countless security vulnerabilities and crashes. Rust makes it impossible.</p>

<h2>Another Scenario: Reference Outliving Its Value in a Block</h2>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// This does NOT compile.
fn main() {
    let r;

    {
        let x = 5;
        r = &amp;x; // r borrows x, but x only lives until the end of this block
    } // x is dropped here. r now refers to freed memory.

    println!("r: {}", r); // error: x does not live long enough
}</code></pre>
</div>

<p>The compiler tracks that <code>x</code> is dropped at the end of the inner block, while <code>r</code> is still alive in the outer scope. This is a Rule 2 violation: the reference would outlive its referent. Rust rejects it.</p>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Returning a Reference to a Local String</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN
fn get_greeting() -&gt; &amp;String {
    let greeting = String::from("Hello!");
    &amp;greeting  // greeting will be dropped; the reference would dangle
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: return the owned String
fn get_greeting() -&gt; String {
    String::from("Hello!")  // ownership moves to the caller
}

fn main() {
    let g = get_greeting();
    println!("{}", g);
}</code></pre>
</div>

<h3>Mistake 2: Keeping a Reference Past Its Owner's Scope</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN
fn main() {
    let r;
    {
        let data = vec![1, 2, 3];
        r = &amp;data; // data is dropped at the end of this block
    }
    println!("{:?}", r); // error: data does not live long enough
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: keep the owner alive as long as the reference is needed
fn main() {
    let data = vec![1, 2, 3]; // data lives for the whole function
    let r = &amp;data;
    println!("{:?}", r); // [1, 2, 3]
}</code></pre>
</div>

<h3>Mistake 3: Returning a Reference to a Temporary Value</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN
fn first_char(s: String) -&gt; &amp;str {
    &amp;s[0..1]  // s is consumed by this function; the slice would dangle
}

fn main() {
    let result = first_char(String::from("hello"));
    println!("{}", result);
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED option 1: take &amp;str instead of owning the String
fn first_char(s: &amp;str) -&gt; &amp;str {
    &amp;s[0..1]  // slice of the input, which lives in the caller
}

fn main() {
    let s = String::from("hello");
    println!("{}", first_char(&amp;s)); // h
}</code></pre>
</div>
`
  },

  /* ---------------------------------------------------------------
     Chapter 24: Slices
     --------------------------------------------------------------- */
  'ch24': {
    moduleNum: 4,
    moduleTitle: 'Ownership & Borrowing',
    chNum: 24,
    title: 'Slices',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 4 &mdash; Chapter 24</span>
</div>

<h1>Slices</h1>

<p>You now understand references: a way to borrow access to a value without taking ownership. A <strong>slice</strong> is a special kind of reference that borrows a <em>contiguous portion</em> of a collection rather than the whole thing. Slices let you work with parts of strings, arrays, and other sequences without copying the data, and the borrow checker keeps those parts in sync with the original collection.</p>

<h2>The Sliding Window Analogy</h2>

<p>Imagine a long document printed on paper. Instead of photocopying the parts you need, you take a transparent plastic frame (a window) and lay it over the document so it reveals just the section you want to read. The frame does not copy the text; it just exposes a portion of the original. If someone erases part of the document while your frame is on it, what you see through the frame changes too. Your frame is tied to the original document.</p>

<p>A Rust slice works the same way. It is a reference (a "window") into a contiguous region of an existing collection. The slice does not own the data. It is just a view into memory owned by someone else.</p>

<h2>String Slices: &amp;str</h2>

<p>A string slice is a reference to a portion of a <code>String</code>. Its type is <code>&amp;str</code>. You create one with the range syntax <code>&amp;s[start..end]</code>, where <code>start</code> is the index of the first byte and <code>end</code> is one past the last byte.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let s = String::from("hello world");

    let hello = &amp;s[0..5];   // bytes 0, 1, 2, 3, 4  =&gt; "hello"
    let world = &amp;s[6..11];  // bytes 6, 7, 8, 9, 10  =&gt; "world"

    println!("{}", hello); // hello
    println!("{}", world); // world
    println!("{}", s);     // hello world (still fully valid)
}</code></pre>
</div>

<pre class="output"><code>hello
world
hello world</code></pre>

<p>A <code>&amp;str</code> value stores two pieces of information internally: a pointer to the starting byte in the original string's memory, and a length. It does not allocate any new memory. The original <code>String</code> <code>s</code> still owns the heap allocation.</p>

<h2>Range Shorthand</h2>

<p>Rust provides shorthand for common slice boundaries so you do not have to write explicit zero or length values:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let s = String::from("hello");

    let a = &amp;s[0..3]; // bytes 0, 1, 2
    let b = &amp;s[..3];  // same thing: omit 0

    let c = &amp;s[2..s.len()]; // bytes 2 to end
    let d = &amp;s[2..];         // same thing: omit len()

    let e = &amp;s[0..s.len()]; // entire string
    let f = &amp;s[..];          // same thing: omit both

    println!("{} {} {} {} {} {}", a, b, c, d, e, f);
}</code></pre>
</div>

<pre class="output"><code>hel hel llo llo hello hello</code></pre>

<h2>The Problem That Slices Solve</h2>

<p>To understand why slices exist, consider the alternative. Suppose you want a function that returns the first word of a sentence. Without slices, you could return the <em>index</em> of where the first word ends:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Without slices: return an index into the string
fn first_word_index(s: &amp;String) -&gt; usize {
    let bytes = s.as_bytes();
    for (i, &amp;byte) in bytes.iter().enumerate() {
        if byte == b' ' {
            return i; // index of the space
        }
    }
    s.len() // no space found; whole string is one word
}

fn main() {
    let mut s = String::from("hello world");
    let idx = first_word_index(&amp;s); // idx = 5

    s.clear(); // clears the string to ""

    // idx is still 5, but s is now empty!
    // idx is now meaningless, but the compiler does not know that.
    println!("word ends at index: {}", idx); // 5 -- but wrong now!
}</code></pre>
</div>

<pre class="output"><code>word ends at index: 5</code></pre>

<p>The index <code>5</code> has become stale the moment <code>s.clear()</code> ran. The compiler does not catch this because the index is just a <code>usize</code>, disconnected from the string. This is a subtle bug waiting to happen. Slices solve this completely.</p>

<h2>Using a Slice to Return Part of a String</h2>

<p>With slices, the function can return a <code>&amp;str</code> that is directly tied to the original string. Now the borrow checker can enforce that the original string does not change while the slice exists:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn first_word(s: &amp;String) -&gt; &amp;str {
    let bytes = s.as_bytes();
    for (i, &amp;byte) in bytes.iter().enumerate() {
        if byte == b' ' {
            return &amp;s[0..i]; // slice of the first word
        }
    }
    &amp;s[..] // whole string is one word
}

fn main() {
    let s = String::from("hello world");
    let word = first_word(&amp;s); // word is a &amp;str pointing into s

    // s.clear(); // this would cause a compile error!
    // clear() needs &amp;mut s, but s is immutably borrowed via 'word'

    println!("first word: {}", word); // hello
}</code></pre>
</div>

<pre class="output"><code>first word: hello</code></pre>

<p>Now try uncommenting <code>s.clear()</code>. The compiler would reject it with: "cannot borrow <code>s</code> as mutable because it is also borrowed as immutable." The slice <code>word</code> holds an immutable borrow of <code>s</code>, and <code>clear()</code> would need a mutable borrow. The borrow checker catches the bug at compile time, before your code ever runs.</p>

<h2>String Literals Are &amp;str Slices</h2>

<p>String literals like <code>"hello"</code> have type <code>&amp;str</code>. They are slices pointing into the program's binary data, which is loaded into read-only memory when the program starts. This is why string literals are immutable: the data they refer to is baked into the executable.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    // Type of s is &amp;str: a slice of the string literal in the binary.
    let s: &amp;str = "Hello, world!";

    // String literals and slices of Strings have the same type.
    let owned = String::from("some text");
    let as_slice: &amp;str = &amp;owned; // entire String as a &amp;str slice

    println!("{}", s);
    println!("{}", as_slice);
}</code></pre>
</div>

<pre class="output"><code>Hello, world!
some text</code></pre>

<h2>Using &amp;str Instead of &amp;String in Function Parameters</h2>

<p>A function that accepts <code>&amp;str</code> is more flexible than one that accepts <code>&amp;String</code>. It works with string literals, with slices of Strings, and with whole Strings (via auto-deref). Prefer <code>&amp;str</code> as the parameter type whenever you only need to read string data:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn print_words(s: &amp;str) {
    for word in s.split_whitespace() {
        println!("  {}", word);
    }
}

fn main() {
    let owned = String::from("one two three");
    let literal = "four five six";

    print_words(&amp;owned);  // works: &amp;String coerces to &amp;str
    print_words(literal); // works: &amp;str directly
    print_words(&amp;owned[4..7]); // works: a slice
}</code></pre>
</div>

<pre class="output"><code>  one
  two
  three
  four
  five
  six
  two</code></pre>

<h2>Array Slices: &amp;[T]</h2>

<p>Slices work for any contiguous sequence, not just strings. An array slice has type <code>&amp;[T]</code> and uses the same range syntax:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn sum_slice(nums: &amp;[i32]) -&gt; i32 {
    let mut total = 0;
    for n in nums {
        total += n;
    }
    total
}

fn main() {
    let arr = [10, 20, 30, 40, 50];

    let whole: &amp;[i32] = &amp;arr;         // entire array as a slice
    let middle: &amp;[i32] = &amp;arr[1..4];  // elements at index 1, 2, 3

    println!("sum of whole:  {}", sum_slice(whole));  // 150
    println!("sum of middle: {}", sum_slice(middle)); // 90

    // Passing an array directly also works via auto-coercion.
    println!("sum of arr:    {}", sum_slice(&amp;arr));   // 150
}</code></pre>
</div>

<pre class="output"><code>sum of whole:  150
sum of middle: 90
sum of arr:    150</code></pre>

<div class="callout">
  <div class="callout-label">Slices Are Just Fat Pointers</div>
  <p>Internally, a slice is a two-word struct: a pointer to the first element and a length. That is all. No heap allocation, no copying. When you pass a <code>&amp;str</code> or <code>&amp;[T]</code> to a function, you are passing 16 bytes (on 64-bit systems): 8 for the pointer, 8 for the length. This is why slices are fast and why functions should prefer them over taking full ownership.</p>
</div>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Slicing in the Middle of a Multi-Byte UTF-8 Character</h3>

<p>Rust strings are UTF-8. Some characters take more than one byte (for example, many emoji take 4 bytes). If your slice boundary falls inside a multi-byte character, Rust panics at runtime.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN at runtime
fn main() {
    let s = String::from("Hello"); // all ASCII, safe
    let _ok = &amp;s[0..3]; // fine

    let emoji = String::from("\u{1F600}"); // one emoji, 4 bytes
    // &amp;emoji[0..1] would panic: byte index 1 is not a char boundary!
    // Uncomment the next line to see the panic:
    // let _bad = &amp;emoji[0..1];
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: use char-aware methods when working with non-ASCII content
fn main() {
    let s = String::from("Hello world");
    // Use chars() to work with characters, not bytes.
    let first_five: String = s.chars().take(5).collect();
    println!("{}", first_five); // Hello
}</code></pre>
</div>

<h3>Mistake 2: Modifying a String While Holding a Slice of It</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN
fn main() {
    let mut s = String::from("hello world");
    let word = &amp;s[..5];   // immutable borrow via slice
    s.push_str("!!!");    // error: mutable borrow while immutable borrow exists
    println!("{}", word);
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: finish using the slice before modifying the string
fn main() {
    let mut s = String::from("hello world");
    println!("{}", &amp;s[..5]); // use the slice inline; no stored reference
    s.push_str("!!!");
    println!("{}", s); // hello world!!!
}</code></pre>
</div>

<h3>Mistake 3: Using an Out-of-Bounds Slice Range</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN at runtime: panics on out-of-bounds
fn main() {
    let s = String::from("hi");
    let _bad = &amp;s[0..10]; // string is only 2 bytes; panics!
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: check length or use get() which returns Option
fn main() {
    let s = String::from("hi");
    let end = s.len().min(10); // clamp to actual length
    let safe = &amp;s[0..end];
    println!("{}", safe); // hi
}</code></pre>
</div>
`
  },

  /* ---------------------------------------------------------------
     Chapter 25: Borrow Checker Errors
     --------------------------------------------------------------- */
  'ch25': {
    moduleNum: 4,
    moduleTitle: 'Ownership & Borrowing',
    chNum: 25,
    title: 'Borrow Checker Errors',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 4 &mdash; Chapter 25</span>
</div>

<h1>Borrow Checker Errors</h1>

<p>New Rust programmers often describe the borrow checker as an obstacle. With experience, it becomes clear that the borrow checker is a guide: every error it reports points to a real bug or a design problem in the code. This chapter demystifies the most common borrow checker errors, teaches you how to read them, and gives you concrete strategies for fixing them.</p>

<h2>How to Read a Borrow Checker Error</h2>

<p>Rust's compiler errors follow a consistent pattern. Each one has an error code (like <code>E0382</code>), a plain-English description, and a precise location in your source file. The error also shows you <em>where</em> the conflicting borrow started. Reading all three parts, not just the first line, is the key to understanding what needs to change.</p>

<div class="callout">
  <div class="callout-label">Your First Move: Read the Full Error</div>
  <p>When you get a borrow checker error, resist the urge to immediately change the line with the red squiggle. First, read the note and help sections below the main error. They tell you where the conflicting borrow started. That earlier line is usually where the real fix needs to happen.</p>
</div>

<h2>Error 1: Use of Moved Value (E0382)</h2>

<p>This error occurs when you try to use a value after its ownership has been moved elsewhere. The moved value is no longer valid in the original location.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: E0382
fn consume(s: String) {
    println!("consumed: {}", s);
}

fn main() {
    let s = String::from("hello");
    consume(s);           // s is moved here
    println!("{}", s);    // error: use of moved value: s
}</code></pre>
</div>

<p>The three ways to fix this are: use a reference, clone the value, or restructure so you do not need the value after the move:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIX 1: pass a reference instead of moving
fn consume_ref(s: &amp;String) {
    println!("consumed: {}", s);
}

fn main() {
    let s = String::from("hello");
    consume_ref(&amp;s);      // borrow, not move
    println!("{}", s);    // still valid
}

// FIX 2: clone if you need an independent copy
fn main2() {
    let s = String::from("hello");
    consume(s.clone());   // consume a clone
    println!("{}", s);    // original still valid
}</code></pre>
</div>

<h2>Error 2: Two Mutable Borrows (E0499)</h2>

<p>This error occurs when you try to create two mutable references to the same value at the same time.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: E0499
fn main() {
    let mut s = String::from("hello");
    let r1 = &amp;mut s;
    let r2 = &amp;mut s; // error: cannot borrow s as mutable more than once at a time
    println!("{} {}", r1, r2);
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIX: use scopes so the borrows do not overlap
fn main() {
    let mut s = String::from("hello");
    {
        let r1 = &amp;mut s;
        r1.push_str("_1");
    } // r1's borrow ends
    let r2 = &amp;mut s; // now allowed
    r2.push_str("_2");
    println!("{}", s); // hello_1_2
}</code></pre>
</div>

<h2>Error 3: Mutable Borrow While Immutable Borrow Exists (E0502)</h2>

<p>This error occurs when you try to mutate a value while an immutable reference to it is still active. The classic example is calling a method that requires <code>&amp;mut self</code> while a borrow of the object exists:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: E0502
fn main() {
    let mut v = vec![1, 2, 3];
    let first = &amp;v[0];    // immutable borrow of v begins
    v.push(10);            // error: mutable borrow while immutable borrow exists
    println!("{}", first);
}</code></pre>
</div>

<p>This specific example is dangerous beyond just the compiler error: <code>v.push(10)</code> might reallocate the vector's buffer to a new location in memory. If that happens, <code>first</code> would be pointing to freed memory. The borrow checker catches this.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIX: do not hold the reference across the mutation
fn main() {
    let mut v = vec![1, 2, 3];
    println!("first: {}", v[0]); // use v[0] directly; no stored reference
    v.push(10);
    println!("v: {:?}", v); // [1, 2, 3, 10]
}</code></pre>
</div>

<h2>Error 4: Moving Out of a Borrowed Value (E0505)</h2>

<p>You cannot move a value out of a location that is currently borrowed. Moving transfers ownership, which would invalidate the value while a borrow still points to it:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: E0505
fn main() {
    let mut s = String::from("hello");
    let r = &amp;s;          // s is borrowed
    let t = s;            // error: cannot move s because it is borrowed
    println!("{}", r);
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIX: let the borrow end before moving
fn main() {
    let s = String::from("hello");
    {
        let r = &amp;s;
        println!("{}", r); // last use of r; borrow ends here (NLL)
    }
    let t = s;             // safe to move now; no active borrows
    println!("{}", t);
}</code></pre>
</div>

<h2>General Strategies for Fixing Borrow Checker Errors</h2>

<dl>
  <dt>Strategy 1: Shorten the borrow's lifetime</dt>
  <dd>If two borrows conflict, can you restructure the code so one ends before the other begins? Use an inner block or move the last use of a reference earlier.</dd>
  <dt>Strategy 2: Clone instead of borrow</dt>
  <dd>If you need two independent copies of data, clone one. Cloning avoids the conflict entirely, at the cost of an allocation.</dd>
  <dt>Strategy 3: Return or pass ownership instead of referencing</dt>
  <dd>Sometimes the right answer is to give up on references entirely and return or pass owned values. This is especially true if the data is small or if lifetimes become complex.</dd>
  <dt>Strategy 4: Use interior mutability (Cell, RefCell)</dt>
  <dd>When the borrow checker's static analysis is too conservative for your use case (and you are certain your code is safe), interior mutability provides an escape hatch. This is covered in Chapter 26.</dd>
</dl>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Modifying a Collection While Iterating Over It</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN
fn main() {
    let mut v = vec![1, 2, 3, 4, 5];
    for x in &amp;v {
        if *x == 3 {
            v.push(99); // error: cannot borrow v as mutable while borrowed as immutable
        }
    }
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: collect modifications and apply after the loop
fn main() {
    let v = vec![1, 2, 3, 4, 5];
    let mut to_add = vec![];
    for &amp;x in &amp;v {
        if x == 3 {
            to_add.push(99);
        }
    }
    let mut v = v;
    for item in to_add {
        v.push(item);
    }
    println!("{:?}", v); // [1, 2, 3, 4, 5, 99]
}</code></pre>
</div>

<h3>Mistake 2: Trying to Return a Reference to Data Created Inside the Function</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: the returned reference would dangle
fn build_and_ref() -&gt; &amp;str {
    let s = String::from("built locally");
    &amp;s // s is dropped at end of function; this reference would dangle
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: return an owned value
fn build_and_own() -&gt; String {
    String::from("built locally")
}

fn main() {
    let s = build_and_own();
    println!("{}", s);
}</code></pre>
</div>
`
  },

  /* ---------------------------------------------------------------
     Chapter 26: Interior Mutability (Cell, RefCell)
     --------------------------------------------------------------- */
  'ch26': {
    moduleNum: 4,
    moduleTitle: 'Ownership & Borrowing',
    chNum: 26,
    title: 'Interior Mutability (Cell, RefCell)',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 4 &mdash; Chapter 26</span>
</div>

<h1>Interior Mutability (Cell, RefCell)</h1>

<p>Rust's borrow checker enforces mutation rules at compile time: to mutate a value, you need a <code>&amp;mut</code> reference, and only one can exist at a time. This works perfectly for most cases. But sometimes you have a design where a struct needs to track internal state (like a counter or cache) while only exposing an immutable interface (<code>&amp;self</code>). The borrow checker's static rules would prevent this. <strong>Interior mutability</strong> is the solution: a set of types in Rust's standard library that move the borrow checks to runtime, allowing mutation through an immutable reference in controlled circumstances.</p>

<h2>The Sealed Lockbox Analogies</h2>

<p><strong>Cell:</strong> Think of a sealed lockbox with a slot on top and a hatch on the bottom. You can drop a new value in through the slot (replacing the old one), or push the current value out through the hatch. But you cannot look inside while the box is sealed. You can only <em>exchange</em> values. This means Cell works best for simple types you can move in and out (integers, booleans).</p>

<p><strong>RefCell:</strong> Think of a library book with a checkout ledger at the front desk. You can check out an immutable copy to read (as many readers as you want), or check out a mutable copy to write annotations (only one at a time). The desk clerk (RefCell) keeps count. If you try to check out a second write copy while one is already out, the clerk refuses on the spot (runtime panic). The rules are the same as the borrow checker's rules, just enforced at runtime instead of compile time.</p>

<h2>Cell&lt;T&gt;: Interior Mutability for Copy Types</h2>

<p><code>Cell&lt;T&gt;</code> provides interior mutability by moving values in and out. It never hands out a reference to the inner value; you can only set a new value or get the current value (for types that implement <code>Copy</code>). Because no reference into the interior ever exists, no borrow rules can be violated.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::cell::Cell;

fn main() {
    let cell = Cell::new(5_i32); // create a Cell holding 5

    println!("initial: {}", cell.get()); // get() copies the value out: 5

    cell.set(10); // replace the interior value with 10
    println!("after set: {}", cell.get()); // 10

    cell.set(cell.get() * 2); // read and write in one step
    println!("doubled: {}", cell.get()); // 20
}</code></pre>
</div>

<pre class="output"><code>initial: 5
after set: 10
doubled: 20</code></pre>

<p>Notice that <code>cell</code> is NOT declared as <code>mut</code>. Cell provides interior mutability: you can mutate the value it holds through a shared (<code>&amp;</code>) reference to the Cell itself. This is the core of the pattern.</p>

<h2>Cell in a Struct: Mutating Through &amp;self</h2>

<p>The real power of <code>Cell</code> appears when you have a struct that needs to track internal state through an immutable interface:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::cell::Cell;

struct Counter {
    count: Cell&lt;u32&gt;,
    name: String,
}

impl Counter {
    fn new(name: &amp;str) -&gt; Self {
        Counter {
            count: Cell::new(0),
            name: name.to_string(),
        }
    }

    // &amp;self (immutable), yet we can increment the counter!
    fn increment(&amp;self) {
        self.count.set(self.count.get() + 1);
    }

    fn value(&amp;self) -&gt; u32 {
        self.count.get()
    }
}

fn main() {
    let c = Counter::new("page views"); // NOT mut
    c.increment();
    c.increment();
    c.increment();
    println!("{}: {}", c.name, c.value()); // page views: 3
}</code></pre>
</div>

<pre class="output"><code>page views: 3</code></pre>

<p>Without <code>Cell</code>, <code>increment</code> would need <code>&amp;mut self</code>, forcing callers to hold a mutable reference to the <code>Counter</code>. With <code>Cell</code>, the counter can appear immutable to the outside world while quietly tracking its own state internally.</p>

<h2>RefCell&lt;T&gt;: Interior Mutability for Non-Copy Types</h2>

<p><code>RefCell&lt;T&gt;</code> works like <code>Cell</code> but hands out actual references (<code>Ref&lt;T&gt;</code> for immutable, <code>RefMut&lt;T&gt;</code> for mutable). It enforces Rust's borrow rules at <em>runtime</em> instead of compile time: if you violate them, it panics. The API uses two methods: <code>borrow()</code> for immutable access, <code>borrow_mut()</code> for mutable access.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::cell::RefCell;

fn main() {
    let cell = RefCell::new(String::from("hello"));

    // Immutable borrow: returns Ref&lt;String&gt;
    {
        let r = cell.borrow();
        println!("read: {}", *r); // hello
    } // r (the Ref guard) drops here; immutable borrow ends

    // Mutable borrow: returns RefMut&lt;String&gt;
    {
        let mut w = cell.borrow_mut();
        w.push_str(" world");
    } // w drops here; mutable borrow ends

    println!("after mutation: {}", cell.borrow()); // hello world
}</code></pre>
</div>

<pre class="output"><code>read: hello
after mutation: hello world</code></pre>

<h2>RefCell in a Struct: Mutating Non-Copy Fields Through &amp;self</h2>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::cell::RefCell;

struct Logger {
    messages: RefCell&lt;Vec&lt;String&gt;&gt;,
}

impl Logger {
    fn new() -&gt; Self {
        Logger { messages: RefCell::new(vec![]) }
    }

    // Takes &amp;self (immutable), yet appends to the Vec inside.
    fn log(&amp;self, msg: &amp;str) {
        self.messages.borrow_mut().push(msg.to_string());
    }

    fn print_all(&amp;self) {
        for msg in self.messages.borrow().iter() {
            println!("  [log] {}", msg);
        }
    }
}

fn main() {
    let logger = Logger::new(); // NOT mut
    logger.log("Starting up");
    logger.log("Processing data");
    logger.log("Done");
    logger.print_all();
}</code></pre>
</div>

<pre class="output"><code>  [log] Starting up
  [log] Processing data
  [log] Done</code></pre>

<h2>Runtime Panic: When You Violate the Rules</h2>

<p>RefCell moves the borrow check to runtime. If you try to take out two mutable borrows at the same time, it panics immediately:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::cell::RefCell;

fn main() {
    let cell = RefCell::new(42_i32);

    let _borrow1 = cell.borrow_mut(); // first mutable borrow: OK
    let _borrow2 = cell.borrow_mut(); // second mutable borrow: PANIC at runtime
    // thread panics: already mutably borrowed
}</code></pre>
</div>

<p>The panic message will say something like "already mutably borrowed." This is the same rule as the compile-time borrow checker, just enforced at runtime. The fix is to ensure the first borrow ends (the <code>RefMut</code> guard drops) before the second begins.</p>

<h2>Rc&lt;RefCell&lt;T&gt;&gt;: Shared Mutable Data</h2>

<p>A common pattern in single-threaded Rust is combining <code>Rc&lt;T&gt;</code> (shared ownership, covered in Module 9) with <code>RefCell&lt;T&gt;</code> to get data with multiple owners that can still be mutated:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::rc::Rc;
use std::cell::RefCell;

fn main() {
    // A shared counter that both a and b can increment.
    let shared = Rc::new(RefCell::new(0_i32));

    let a = Rc::clone(&amp;shared); // a is another owner
    let b = Rc::clone(&amp;shared); // b is another owner

    *a.borrow_mut() += 10;
    *b.borrow_mut() += 5;

    println!("shared value: {}", shared.borrow()); // 15
}</code></pre>
</div>

<pre class="output"><code>shared value: 15</code></pre>

<div class="callout">
  <div class="callout-label">Cell vs RefCell: Which to Use</div>
  <p>Use <code>Cell&lt;T&gt;</code> when <code>T</code> implements <code>Copy</code> (numbers, booleans, small structs). It has zero runtime overhead because it never produces references. Use <code>RefCell&lt;T&gt;</code> when you need actual references to the interior (<code>Vec</code>, <code>String</code>, complex types). It has a small runtime cost for tracking the borrow count. Both are for <strong>single-threaded</strong> code only. For multithreaded code, use <code>Mutex&lt;T&gt;</code> or <code>RwLock&lt;T&gt;</code> from <code>std::sync</code>.</p>
</div>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Holding a RefMut Guard Alive Across Another Borrow</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: runtime panic
use std::cell::RefCell;

fn main() {
    let cell = RefCell::new(vec![1, 2, 3]);
    let mut w = cell.borrow_mut(); // mutable borrow taken
    w.push(4);
    let r = cell.borrow();    // PANIC: already mutably borrowed
    println!("{:?}", *r);
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: drop the mutable borrow before immutable borrow
use std::cell::RefCell;

fn main() {
    let cell = RefCell::new(vec![1, 2, 3]);
    {
        let mut w = cell.borrow_mut();
        w.push(4);
    } // w drops here; mutable borrow ends
    let r = cell.borrow(); // now safe
    println!("{:?}", *r);  // [1, 2, 3, 4]
}</code></pre>
</div>

<h3>Mistake 2: Using RefCell When a Regular &amp;mut Reference Would Work</h3>

<p>RefCell adds runtime overhead and defers error detection. If you can use a plain <code>&amp;mut</code> reference (compile-time checked), you should. Only reach for RefCell when the borrow checker cannot verify safety statically.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// UNNECESSARY: RefCell adds overhead where &amp;mut is fine
use std::cell::RefCell;

fn add_item(list: &amp;RefCell&lt;Vec&lt;i32&gt;&gt;, item: i32) {
    list.borrow_mut().push(item);
}

// BETTER: use &amp;mut directly when possible
fn add_item_better(list: &amp;mut Vec&lt;i32&gt;, item: i32) {
    list.push(item);
}

fn main() {
    let mut v = vec![1, 2];
    add_item_better(&amp;mut v, 3);
    println!("{:?}", v); // [1, 2, 3]
}</code></pre>
</div>

<h3>Mistake 3: Using RefCell in Multithreaded Code</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: RefCell is not thread-safe
// use std::cell::RefCell;
// use std::sync::Arc;
// let shared = Arc::new(RefCell::new(0)); // compile error: RefCell is not Sync

// FIXED: use Mutex for thread-safe interior mutability
use std::sync::{Arc, Mutex};

fn main() {
    let shared = Arc::new(Mutex::new(0_i32));
    let clone = Arc::clone(&amp;shared);

    let handle = std::thread::spawn(move || {
        *clone.lock().unwrap() += 1;
    });

    handle.join().unwrap();
    println!("value: {}", shared.lock().unwrap()); // 1
}</code></pre>
</div>
`
  },

});
