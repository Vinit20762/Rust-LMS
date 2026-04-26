Object.assign(CHAPTERS_CONTENT, {
  'ch85': {
    moduleNum: 13,
    moduleTitle: 'Unsafe Rust &amp; FFI',
    chNum: 85,
    title: 'Meaning of unsafe',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 13 &mdash; Chapter 85</span>
</div>
<h1>Meaning of unsafe</h1>

<p>Rust's signature promise is memory safety: no null pointer dereferences, no use-after-free, no data races. The compiler enforces this automatically. But there are situations where the compiler's rules are too strict for the task at hand: calling into a C library, writing an operating system kernel, building a high-performance allocator, or implementing data structures the borrow checker cannot verify.</p>

<p>For these cases, Rust provides the <code>unsafe</code> keyword. Understanding what it means, and what it does NOT mean, is the first step to using it correctly.</p>

<h2>Analogy: Power Tools vs Hand Tools</h2>

<p>A hand saw is safe by design. You can hurt yourself, but it is slow and the damage is limited. A circular saw is far more powerful and useful for certain jobs, but it demands that the operator knows what they are doing. <code>unsafe</code> is the circular saw: it gives you more power, but the responsibility for safe use shifts from the compiler to you.</p>

<p>Crucially, a circular saw does not make all woodworking dangerous. You use it only for the cuts that require it, keep it contained to a dedicated workspace, and use hand tools for everything else. That is exactly how you should use <code>unsafe</code> in Rust.</p>

<h2>What unsafe Means</h2>

<p>The <code>unsafe</code> keyword is a contract. When you write <code>unsafe { ... }</code>, you are telling the compiler: "I have verified that the operations inside are memory safe, even though you cannot check that yourself."</p>

<p>The compiler still enforces all of its normal rules inside an unsafe block. It still checks types, lifetimes, and borrow rules. It only unlocks five additional capabilities:</p>

<div class="step">
  <div class="step-num">1</div>
  <div class="step-body"><p><strong>Dereference raw pointers</strong> (<code>*const T</code> and <code>*mut T</code>). These can be null, dangling, or misaligned.</p></div>
</div>
<div class="step">
  <div class="step-num">2</div>
  <div class="step-body"><p><strong>Call unsafe functions or methods.</strong> Functions that require the caller to uphold invariants the compiler cannot verify.</p></div>
</div>
<div class="step">
  <div class="step-num">3</div>
  <div class="step-body"><p><strong>Access or modify a mutable static variable.</strong> Global mutable state is inherently not thread-safe.</p></div>
</div>
<div class="step">
  <div class="step-num">4</div>
  <div class="step-body"><p><strong>Implement an unsafe trait.</strong> Traits like <code>Send</code> and <code>Sync</code> are unsafe to implement because the compiler cannot verify their correctness automatically.</p></div>
</div>
<div class="step">
  <div class="step-num">5</div>
  <div class="step-body"><p><strong>Access fields of a <code>union</code>.</strong> Rust cannot know which variant is active without your help.</p></div>
</div>

<h2>A Minimal unsafe Block</h2>

<p>Here is the smallest possible demonstration: dereferencing a raw pointer, which requires unsafe:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let x: i32 = 42;

    // Create a raw pointer from a reference (safe — no unsafe needed)
    let raw: *const i32 = &amp;x;

    // Dereferencing a raw pointer requires unsafe
    unsafe {
        println!("Value via raw pointer: {}", *raw);
    }
}</code></pre>
</div>

<pre class="output"><code>Value via raw pointer: 42</code></pre>

<p>The creation of the raw pointer is safe. Only the dereference (reading through it) requires <code>unsafe</code> because the compiler cannot guarantee the pointer is valid at that point.</p>

<h2>Calling an unsafe Function</h2>

<p>Functions can be declared <code>unsafe</code> to signal that the caller must uphold some invariant. The standard library has several such functions:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let v = vec![1u8, 2, 3, 4, 5];

    // get_unchecked is unsafe: the caller guarantees the index is in bounds
    let val = unsafe { v.get_unchecked(2) };
    println!("Element at index 2: {}", val);
}</code></pre>
</div>

<pre class="output"><code>Element at index 2: 3</code></pre>

<div class="callout">
  <div class="callout-label">Note</div>
  <p><code>get_unchecked</code> skips the bounds check for performance. If you pass an out-of-bounds index, you get undefined behavior: reading garbage memory, crashing, or worse. The safe version, <code>v.get(2)</code>, returns an <code>Option</code> and never has undefined behavior. Only use the unchecked version when the performance difference is proven to matter and the invariant is provably upheld.</p>
</div>

<h2>Mutable Static Variables</h2>

<p>A global mutable variable (static mut) is inherently unsafe because multiple threads could read and write it simultaneously without synchronization:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">static mut COUNTER: u32 = 0;

fn add_to_counter(value: u32) {
    // Accessing static mut requires unsafe
    unsafe {
        COUNTER += value;
    }
}

fn main() {
    add_to_counter(5);
    add_to_counter(10);
    unsafe {
        println!("Counter: {}", COUNTER); // 15
    }
}</code></pre>
</div>

<pre class="output"><code>Counter: 15</code></pre>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>In real code, prefer <code>std::sync::atomic</code> types (like <code>AtomicU32</code>) or <code>Mutex&lt;T&gt;</code> for shared mutable state. <code>static mut</code> is only safe in single-threaded contexts and even then requires extreme care.</p>
</div>

<h2>Writing an unsafe Function</h2>

<p>You mark a function <code>unsafe</code> to tell callers that they must uphold preconditions you cannot express in the type system:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// SAFETY: caller must ensure ptr is non-null and points to a valid i32
unsafe fn read_i32(ptr: *const i32) -&gt; i32 {
    *ptr
}

fn main() {
    let value: i32 = 100;
    let ptr: *const i32 = &amp;value;

    // We know ptr is valid because we just created it from a reference
    let result = unsafe { read_i32(ptr) };
    println!("Read: {}", result);
}</code></pre>
</div>

<pre class="output"><code>Read: 100</code></pre>

<h2>The Golden Rule: Minimize the unsafe Surface</h2>

<p>The best practice is to keep <code>unsafe</code> blocks as small as possible and document why each one is safe. This way, when reading the code later, you only need to audit the small unsafe sections rather than the entire program.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn safe_get_first(slice: &amp;[i32]) -&gt; Option&lt;i32&gt; {
    if slice.is_empty() {
        return None;
    }
    // SAFETY: we just verified the slice is non-empty, so index 0 is valid
    Some(unsafe { *slice.get_unchecked(0) })
}

fn main() {
    let data = vec![10, 20, 30];
    println!("{:?}", safe_get_first(&amp;data));   // Some(10)
    println!("{:?}", safe_get_first(&amp;[]));     // None
}</code></pre>
</div>

<pre class="output"><code>Some(10)
None</code></pre>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Thinking unsafe means "anything goes"</h3>
<p>The borrow checker, type system, and all Rust rules still apply inside <code>unsafe</code> blocks. Only the five specific capabilities listed above are unlocked.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let s = String::from("hello");
    unsafe {
        let s2 = s; // this is fine inside unsafe
        // BUG: s is still moved — unsafe doesn't disable move semantics
        println!("{}", s); // compile error: value moved
    }
}</code></pre>
</div>

<p>Fix: move semantics cannot be bypassed with <code>unsafe</code>. Use <code>clone()</code> or restructure ownership.</p>

<h3>Mistake 2: Using unsafe to avoid the borrow checker when safe code would work</h3>
<p>If a safe API exists that solves your problem, use it. Adding unsafe where it isn't needed creates unnecessary risk and makes code harder to audit.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BAD: using unsafe when safe indexing would do fine
fn sum_slice(s: &amp;[i32]) -&gt; i32 {
    let mut total = 0;
    for i in 0..s.len() {
        total += unsafe { s.get_unchecked(i) }; // pointlessly unsafe
    }
    total
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// GOOD: use the safe iterator — the compiler optimizes this equally well
fn sum_slice(s: &amp;[i32]) -&gt; i32 {
    s.iter().sum()
}</code></pre>
</div>

<h3>Mistake 3: Missing SAFETY comments</h3>
<p>Every <code>unsafe</code> block should have a comment explaining why it is actually safe. Without it, auditing the code later becomes guesswork.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BAD: no explanation
unsafe { *ptr }

// GOOD: explains the invariant
// SAFETY: ptr was created from a live reference above and has not been invalidated
unsafe { *ptr }</code></pre>
</div>
`
  },

  'ch86': {
    moduleNum: 13,
    moduleTitle: 'Unsafe Rust &amp; FFI',
    chNum: 86,
    title: 'Raw Pointers',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 13 &mdash; Chapter 86</span>
</div>
<h1>Raw Pointers</h1>

<p>Rust has two kinds of pointers you have used throughout this course: references (<code>&amp;T</code> and <code>&amp;mut T</code>) and smart pointers (<code>Box&lt;T&gt;</code>, <code>Rc&lt;T&gt;</code>, etc.). Both are safe: the borrow checker guarantees they are always valid.</p>

<p>Raw pointers are different. They are closer to the pointers in C or C++: just a memory address with no safety guarantees attached. Rust has two raw pointer types:</p>

<dl>
  <dt><code>*const T</code></dt>
  <dd>An immutable raw pointer to type T. Analogous to <code>const T*</code> in C.</dd>
  <dt><code>*mut T</code></dt>
  <dd>A mutable raw pointer to type T. Analogous to <code>T*</code> in C.</dd>
</dl>

<h2>Analogy: A Street Address vs. a House Key</h2>

<p>A Rust reference is like a house key: it guarantees you can get in, the house exists, and nobody else is using it at the same time (the borrow rules). A raw pointer is just a street address written on a piece of paper. The address might be valid. The house might exist. You might be allowed in. Or it might be an empty lot, a house that was demolished, or someone else's home. You carry all the responsibility to check before you act.</p>

<h2>Creating Raw Pointers</h2>

<p>Creating a raw pointer from a reference is always safe. The borrow checker ensures the reference is valid when you create the pointer. It's only dereferencing (reading through the pointer) that requires <code>unsafe</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let x = 42i32;
    let mut y = 100i32;

    // Create raw pointers from references (safe — no unsafe keyword needed)
    let ptr_const: *const i32 = &amp;x;
    let ptr_mut: *mut i32 = &amp;mut y;

    // Dereferencing requires unsafe
    unsafe {
        println!("*ptr_const = {}", *ptr_const); // 42
        println!("*ptr_mut   = {}", *ptr_mut);   // 100

        *ptr_mut = 200; // write through mutable raw pointer
        println!("after write: y = {}", y);      // 200
    }
}</code></pre>
</div>

<pre class="output"><code>*ptr_const = 42
*ptr_mut   = 100
after write: y = 200</code></pre>

<h2>Null Pointers</h2>

<p>Raw pointers can be null. Dereferencing a null pointer is undefined behavior: your program will almost certainly crash, but the compiler makes no guarantee. Always check for null before dereferencing a raw pointer from an external source:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::ptr;

fn main() {
    // Create explicit null pointers (safe to create, unsafe to dereference)
    let null_const: *const i32 = ptr::null();
    let null_mut: *mut i32 = ptr::null_mut();

    println!("null_const is null: {}", null_const.is_null()); // true
    println!("null_mut   is null: {}", null_mut.is_null());   // true

    // Attempting to dereference null would be undefined behavior:
    // unsafe { *null_const } // DO NOT DO THIS

    // Safe pattern: always check before dereferencing
    if !null_const.is_null() {
        unsafe { println!("value: {}", *null_const); }
    } else {
        println!("pointer is null, skipping dereference");
    }
}</code></pre>
</div>

<pre class="output"><code>null_const is null: true
null_mut   is null: true
pointer is null, skipping dereference</code></pre>

<h2>Pointer Arithmetic</h2>

<p>Raw pointers support offset-based arithmetic for traversing arrays. This is the basis for how slices and iterators work under the hood. The <code>add(n)</code> method advances a pointer by <code>n</code> elements (not bytes) of type T:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let arr: [i32; 5] = [10, 20, 30, 40, 50];
    let base: *const i32 = arr.as_ptr();

    unsafe {
        // Walk the array via pointer arithmetic
        for i in 0..5 {
            let element_ptr = base.add(i);   // advance by i elements
            println!("arr[{}] = {}", i, *element_ptr);
        }
    }
}</code></pre>
</div>

<pre class="output"><code>arr[0] = 10
arr[1] = 20
arr[2] = 30
arr[3] = 40
arr[4] = 50</code></pre>

<div class="callout">
  <div class="callout-label">Note</div>
  <p><code>add(n)</code> is only safe when the resulting pointer stays within the same allocated object (the array). Going past the end is undefined behavior, even if you never dereference the out-of-bounds pointer.</p>
</div>

<h2>Reading and Writing with ptr::read and ptr::write</h2>

<p>For cases where you cannot use the dereference operator directly (for example, when the destination is not yet initialized), Rust provides <code>std::ptr::read</code> and <code>std::ptr::write</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::ptr;
use std::mem::MaybeUninit;

fn main() {
    // Allocate uninitialized space for an i32
    let mut slot: MaybeUninit&lt;i32&gt; = MaybeUninit::uninit();

    unsafe {
        // Write a value into the uninitialized slot
        ptr::write(slot.as_mut_ptr(), 77);

        // Now it is safe to read
        let value = ptr::read(slot.as_ptr());
        println!("value: {}", value); // 77
    }
}</code></pre>
</div>

<pre class="output"><code>value: 77</code></pre>

<h2>Converting Between Raw Pointers and Integers</h2>

<p>Raw pointers can be cast to and from <code>usize</code>. This is occasionally needed when storing pointer values in non-pointer contexts (such as certain atomic operations or C interop):</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let value: i32 = 55;
    let ptr: *const i32 = &amp;value;

    // Cast pointer to integer address
    let addr: usize = ptr as usize;
    println!("Address: 0x{:x}", addr);

    // Cast back to pointer
    let ptr2: *const i32 = addr as *const i32;

    unsafe {
        // SAFETY: ptr2 came from a live reference to value
        println!("Value via recovered pointer: {}", *ptr2); // 55
    }
}</code></pre>
</div>

<h2>Raw Pointers vs References: Summary</h2>

<dl>
  <dt>References (<code>&amp;T</code>, <code>&amp;mut T</code>)</dt>
  <dd>Always valid. Non-null. Borrow-checker enforced. Cannot be null or dangling. Cannot alias a mutable reference.</dd>
  <dt>Raw Pointers (<code>*const T</code>, <code>*mut T</code>)</dt>
  <dd>May be null, dangling, or misaligned. Borrow rules do not apply. Multiple <code>*mut T</code> to the same location are allowed (creating aliases is unsafe). Safe to create, unsafe to dereference.</dd>
</dl>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Dereferencing a dangling pointer</h3>
<p>A dangling pointer points to memory that has been freed or moved. Creating one is easy to do accidentally:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn dangling() -&gt; *const i32 {
    let x = 42;
    &amp;x as *const i32 // BUG: x is dropped when the function returns!
}

fn main() {
    let ptr = dangling();
    unsafe {
        // Undefined behavior: reading freed stack memory
        println!("{}", *ptr);
    }
}</code></pre>
</div>

<p>Fix: never return a raw pointer to a local variable. Return the value directly, use heap allocation (<code>Box::new</code>), or use a lifetime-annotated reference.</p>

<h3>Mistake 2: Pointer arithmetic past array bounds</h3>
<p>Going out of bounds with pointer arithmetic is undefined behavior, even without dereferencing.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">let arr = [1i32, 2, 3];
let ptr = arr.as_ptr();
unsafe {
    // BUG: index 5 is out of bounds for a 3-element array
    println!("{}", *ptr.add(5)); // undefined behavior
}</code></pre>
</div>

<p>Fix: always validate that the offset stays within the allocation boundaries.</p>

<h3>Mistake 3: Creating a &amp;T from an invalid raw pointer</h3>
<p><code>&amp;*ptr</code> creates a reference from a raw pointer. If the pointer is null or dangling, the resulting reference is immediately invalid, which is undefined behavior even before you use it.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">let ptr: *const i32 = std::ptr::null();
unsafe {
    let r: &amp;i32 = &amp;*ptr; // BUG: creating reference to null — UB immediately
    println!("{}", r);
}</code></pre>
</div>

<p>Fix: always verify the pointer is non-null and valid before converting to a reference. Use <code>ptr::as_ref()</code> which returns <code>Option&lt;&amp;T&gt;</code> and handles null safely.</p>
`
  },

  'ch87': {
    moduleNum: 13,
    moduleTitle: 'Unsafe Rust &amp; FFI',
    chNum: 87,
    title: 'FFI with C/C++',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 13 &mdash; Chapter 87</span>
</div>
<h1>FFI with C/C++</h1>

<p>Rust does not exist in isolation. The world has decades of battle-tested C libraries: cryptography libraries, audio codecs, database drivers, operating system APIs. Rust's Foreign Function Interface (FFI) lets you call code written in C (and by extension, C++) directly from Rust, and lets you write Rust code callable from C.</p>

<h2>Analogy: The International Translator</h2>

<p>Imagine two diplomats: one speaks only Russian (Rust) and one speaks only Chinese (C). They can still hold a meeting, but they need a shared protocol. They agree to speak in English (the C ABI) when talking to each other. FFI is that protocol: a set of conventions for how functions are called, how values are passed, and how memory is managed across language boundaries.</p>

<h2>The C ABI: Why C?</h2>

<p>The "C calling convention" (C ABI) is the universal protocol for native code interoperability. Almost every language that needs to call native code does so through the C ABI. When Rust talks to C, C++, Python extensions, or operating system APIs, it uses this convention via <code>extern "C"</code>.</p>

<h2>Calling C Functions from Rust</h2>

<p>To call a C function from Rust, declare it inside an <code>extern "C"</code> block. This tells Rust: "this function exists elsewhere (in a C library), link against it, and use the C calling convention."</p>

<p>The simplest example: calling C's standard library <code>abs</code> function, which computes the absolute value of an integer:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">extern "C" {
    fn abs(n: i32) -&gt; i32;
}

fn main() {
    let x: i32 = -42;

    // All calls to extern "C" functions are unsafe:
    // Rust cannot verify the C code is memory-safe
    let result = unsafe { abs(x) };

    println!("|{}| = {}", x, result); // |-42| = 42
}</code></pre>
</div>

<pre class="output"><code>|-42| = 42</code></pre>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>The C standard library is linked automatically by the Rust toolchain on most platforms. For other C libraries, you need a build script (<code>build.rs</code>) that tells the linker where to find them.</p>
</div>

<h2>Calling Multiple C Functions</h2>

<p>You can declare multiple C functions in a single <code>extern "C"</code> block:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">extern "C" {
    fn abs(n: i32) -&gt; i32;
    fn labs(n: i64) -&gt; i64;  // absolute value for long (i64)
}

fn main() {
    unsafe {
        println!("abs(-10)   = {}", abs(-10));    // 10
        println!("labs(-999) = {}", labs(-999));  // 999
    }
}</code></pre>
</div>

<pre class="output"><code>abs(-10)   = 10
labs(-999) = 999</code></pre>

<h2>String Interoperability: CString and CStr</h2>

<p>C strings are null-terminated byte arrays. Rust strings (<code>String</code> and <code>&amp;str</code>) are NOT null-terminated and may contain null bytes. The standard library provides two types to bridge this gap:</p>

<dl>
  <dt><code>std::ffi::CString</code></dt>
  <dd>An owned, null-terminated string. Use this to create a C string from Rust data to pass to C functions.</dd>
  <dt><code>std::ffi::CStr</code></dt>
  <dd>A borrowed, null-terminated string slice. Use this to work with C strings received from C code.</dd>
</dl>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::ffi::{CString, CStr};
use std::os::raw::c_char;

extern "C" {
    fn strlen(s: *const c_char) -&gt; usize;
}

fn main() {
    // Rust &amp;str -&gt; CString -&gt; *const c_char (for passing to C)
    let rust_str = "Hello, FFI!";
    let c_string = CString::new(rust_str).expect("CString::new failed");

    let len = unsafe { strlen(c_string.as_ptr()) };
    println!("strlen(\"{}\") = {}", rust_str, len); // 11

    // *const c_char -&gt; CStr -&gt; &amp;str (for receiving strings from C)
    let c_str: &amp;CStr = c_string.as_c_str();
    let back: &amp;str = c_str.to_str().expect("invalid UTF-8");
    println!("Converted back: {}", back);
}</code></pre>
</div>

<pre class="output"><code>strlen("Hello, FFI!") = 11
Converted back: Hello, FFI!</code></pre>

<h2>Exporting Rust Functions to C</h2>

<p>You can write Rust functions that C code can call. Two things are required:</p>

<dl>
  <dt><code>pub extern "C"</code></dt>
  <dd>Makes the function use the C calling convention.</dd>
  <dt><code>#[no_mangle]</code></dt>
  <dd>Prevents Rust from renaming (mangling) the function's symbol in the binary. Without this, C code cannot find it by name.</dd>
</dl>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// This function can be called from C as: rust_add(3, 4)
#[no_mangle]
pub extern "C" fn rust_add(a: i32, b: i32) -&gt; i32 {
    a + b
}

#[no_mangle]
pub extern "C" fn rust_greet() {
    println!("Hello from Rust!");
}

// To demonstrate calling from Rust itself:
fn main() {
    let sum = rust_add(3, 4);
    println!("rust_add(3, 4) = {}", sum);
    rust_greet();
}</code></pre>
</div>

<pre class="output"><code>rust_add(3, 4) = 7
Hello from Rust!</code></pre>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>To create a library that C can link against, set <code>crate-type = ["cdylib"]</code> (dynamic library) or <code>crate-type = ["staticlib"]</code> (static library) in your <code>Cargo.toml</code> under <code>[lib]</code>.</p>
</div>

<h2>Type Correspondence: Rust and C</h2>

<p>Types must match exactly across the FFI boundary. The <code>std::os::raw</code> module provides Rust types that correspond to C primitive types:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::os::raw::{c_int, c_long, c_char, c_float, c_double, c_void};
// c_int    == int in C       (i32 on most platforms)
// c_long   == long in C      (platform-dependent: i32 on Windows, i64 on Linux 64-bit)
// c_char   == char in C      (i8 on most platforms)
// c_float  == float in C     (f32)
// c_double == double in C    (f64)
// c_void   == void* in C     (*mut c_void or *const c_void in Rust)

extern "C" {
    // Correct: use c_int, c_double for proper C type mapping
    fn some_c_func(x: c_int, ratio: c_double) -&gt; c_int;
}</code></pre>
</div>

<h2>Using bindgen for Large C Libraries</h2>

<p>Writing <code>extern "C"</code> declarations by hand for a large C library is tedious and error-prone. The <code>bindgen</code> tool automatically generates Rust FFI bindings from C header files. You run it as part of your build process in <code>build.rs</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">bash</span>
  <pre><code class="language-bash"># Install bindgen
cargo install bindgen-cli

# Generate bindings from a C header
bindgen my_library.h -o src/bindings.rs</code></pre>
</div>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>The generated bindings will contain <code>extern "C"</code> declarations, Rust type aliases for C types, and struct definitions. All function calls will still require <code>unsafe</code> blocks since Rust cannot verify the C code's safety.</p>
</div>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Passing a Rust &amp;str directly as a C string</h3>
<p>Rust <code>&amp;str</code> is not null-terminated. Passing it as a <code>*const c_char</code> causes C to read past the end of the string into undefined memory.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">extern "C" { fn strlen(s: *const std::os::raw::c_char) -&gt; usize; }

fn main() {
    let s = "hello";
    // BUG: &amp;str is not null-terminated! C will read past the end.
    let len = unsafe { strlen(s.as_ptr() as *const _) };
    println!("{}", len);
}</code></pre>
</div>

<p>Fix: always convert to <code>CString</code> first, then pass a pointer to its contents.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::ffi::CString;
extern "C" { fn strlen(s: *const std::os::raw::c_char) -&gt; usize; }

fn main() {
    let s = "hello";
    let c_str = CString::new(s).unwrap();   // adds null terminator
    let len = unsafe { strlen(c_str.as_ptr()) }; // safe
    println!("{}", len); // 5
}</code></pre>
</div>

<h3>Mistake 2: Forgetting #[no_mangle] on exported functions</h3>
<p>Without <code>#[no_mangle]</code>, Rust encodes extra information into the symbol name (mangling). The C code cannot find the function because the symbol name in the binary does not match what C expects.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BUG: missing #[no_mangle], symbol name is mangled like "_ZN4mylib8rust_addE"
pub extern "C" fn rust_add(a: i32, b: i32) -&gt; i32 { a + b }</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: symbol name is exactly "rust_add" in the binary
#[no_mangle]
pub extern "C" fn rust_add(a: i32, b: i32) -&gt; i32 { a + b }</code></pre>
</div>

<h3>Mistake 3: Dropping a CString while still holding a pointer to its contents</h3>
<p>The pointer returned by <code>c_string.as_ptr()</code> is only valid while the <code>CString</code> is alive. If the <code>CString</code> is dropped, the pointer becomes dangling.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::ffi::CString;
extern "C" { fn do_something(s: *const std::os::raw::c_char); }

fn get_ptr() -&gt; *const std::os::raw::c_char {
    let s = CString::new("hello").unwrap();
    s.as_ptr() // BUG: s is dropped here, pointer is dangling!
}

fn main() {
    let ptr = get_ptr();
    unsafe { do_something(ptr) }; // undefined behavior
}</code></pre>
</div>

<p>Fix: keep the <code>CString</code> alive for as long as the pointer is used.</p>
`
  },

  'ch88': {
    moduleNum: 13,
    moduleTitle: 'Unsafe Rust &amp; FFI',
    chNum: 88,
    title: 'Writing Safe Wrappers',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 13 &mdash; Chapter 88</span>
</div>
<h1>Writing Safe Wrappers</h1>

<p>The previous chapters showed how to use raw pointers and call C functions, both of which require <code>unsafe</code>. But exposing raw unsafe operations directly in your public API is bad design: it forces every user of your library to write <code>unsafe</code> blocks and reason about low-level invariants.</p>

<p>The professional approach is to write a <strong>safe wrapper</strong>: a Rust struct or function that hides the unsafe internals and exposes a completely safe public API. The <code>unsafe</code> code is contained, auditable, and tested. Users never see it.</p>

<h2>Analogy: The Electrician Behind the Wall</h2>

<p>Your house has dangerous high-voltage wiring inside the walls. You do not interact with it directly. Instead, you flip a switch: a safe interface that hides the danger. The electrician who wired the house used specialized knowledge to set up the wiring correctly. Now everyone else can use it safely without that knowledge. A safe wrapper is the switch. The <code>unsafe</code> code inside is the wiring.</p>

<h2>The Principle: Invariants at the Boundary</h2>

<p>A safe wrapper works by enforcing invariants at the point where safe code hands off to unsafe code. An invariant is a condition that must always be true. For example: "this pointer is always non-null" or "the length never exceeds the capacity." By enforcing these invariants at the safe API boundary, you guarantee the unsafe code inside can rely on them.</p>

<h2>Example 1: Wrapping a Raw Pointer</h2>

<p>Here is a minimal safe wrapper around a heap-allocated value managed through a raw pointer. This is essentially a simplified re-implementation of <code>Box&lt;T&gt;</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// A safe wrapper that owns a heap-allocated T via a raw pointer
pub struct HeapCell&lt;T&gt; {
    ptr: *mut T,
}

impl&lt;T&gt; HeapCell&lt;T&gt; {
    pub fn new(value: T) -&gt; Self {
        // Box allocates on the heap and gives us ownership
        // into_raw transfers that ownership to us as a raw pointer
        let ptr = Box::into_raw(Box::new(value));
        HeapCell { ptr }
    }

    pub fn get(&amp;self) -&gt; &amp;T {
        // SAFETY: ptr is always non-null and valid because:
        // 1. We created it from Box::into_raw in new()
        // 2. We drop it only in Drop::drop()
        // 3. No other code can access ptr
        unsafe { &amp;*self.ptr }
    }

    pub fn get_mut(&amp;mut self) -&gt; &amp;mut T {
        // SAFETY: same as above, plus we have exclusive (&amp;mut self) access
        unsafe { &amp;mut *self.ptr }
    }
}

impl&lt;T&gt; Drop for HeapCell&lt;T&gt; {
    fn drop(&amp;mut self) {
        // SAFETY: ptr was created by Box::into_raw and has not been freed yet
        unsafe { drop(Box::from_raw(self.ptr)); }
    }
}

fn main() {
    let mut cell = HeapCell::new(42i32);
    println!("Value: {}", cell.get()); // 42

    *cell.get_mut() = 100;
    println!("After mutation: {}", cell.get()); // 100
    // cell drops here, freeing the heap memory automatically
}</code></pre>
</div>

<pre class="output"><code>Value: 42
After mutation: 100</code></pre>

<p>The caller never writes a single <code>unsafe</code> block. All the unsafe complexity is hidden and justified inside the implementation.</p>

<h2>Example 2: Wrapping a C Library Function</h2>

<p>Here is a safe Rust wrapper around a C function. The unsafe C call is hidden; the public function signature is fully safe:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::ffi::CString;
use std::os::raw::c_char;

extern "C" {
    fn strlen(s: *const c_char) -&gt; usize;
}

// Safe wrapper: users call this instead of the raw FFI declaration
pub fn c_strlen(s: &amp;str) -&gt; usize {
    // SAFETY:
    // 1. CString::new adds a null terminator and returns Err only if s contains interior nulls
    // 2. as_ptr() is valid for the lifetime of c_str (which lives through the strlen call)
    // 3. strlen reads only up to the null terminator and does not write
    let c_str = CString::new(s).expect("string must not contain null bytes");
    unsafe { strlen(c_str.as_ptr()) }
}

fn main() {
    println!("{}", c_strlen("hello"));        // 5
    println!("{}", c_strlen("Rust is cool")); // 12
}</code></pre>
</div>

<pre class="output"><code>5
12</code></pre>

<h2>Example 3: A Bounds-Checked Slice Wrapper</h2>

<p>Many safe wrappers add bounds checking, null checks, or validation around inherently unsafe operations. Here is a wrapper that provides safe indexed access over a raw slice:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">pub struct RawSlice&lt;T&gt; {
    ptr: *const T,
    len: usize,
}

impl&lt;T&gt; RawSlice&lt;T&gt; {
    // SAFETY contract for new: ptr must be valid for reads of len elements
    // and must remain valid for the lifetime 'a (enforced by the return type)
    pub fn from_slice(slice: &amp;[T]) -&gt; Self {
        RawSlice {
            ptr: slice.as_ptr(),
            len: slice.len(),
        }
    }

    // Completely safe: bounds check prevents out-of-bounds access
    pub fn get(&amp;self, index: usize) -&gt; Option&lt;&amp;T&gt; {
        if index &gt;= self.len {
            return None;
        }
        // SAFETY: index is in bounds (checked above), ptr is valid
        Some(unsafe { &amp;*self.ptr.add(index) })
    }

    pub fn len(&amp;self) -&gt; usize {
        self.len
    }
}

fn main() {
    let data = [10, 20, 30, 40, 50];
    let raw = RawSlice::from_slice(&amp;data);

    println!("len = {}", raw.len()); // 5
    println!("get(2) = {:?}", raw.get(2)); // Some(30)
    println!("get(9) = {:?}", raw.get(9)); // None (out of bounds)
}</code></pre>
</div>

<pre class="output"><code>len = 5
get(2) = Some(30)
get(9) = None</code></pre>

<h2>Documenting SAFETY Invariants</h2>

<p>Every <code>unsafe</code> block or function should have a <code>// SAFETY:</code> comment listing the conditions that make the operation valid. This is the industry standard convention in the Rust ecosystem:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Good: documents exactly why the unsafe operation is safe
fn example(slice: &amp;[i32]) -&gt; i32 {
    assert!(!slice.is_empty(), "slice must be non-empty");
    // SAFETY: slice is non-empty (asserted above), so index 0 is valid.
    unsafe { *slice.get_unchecked(0) }
}

// Bad: no justification — future readers cannot verify correctness
fn example_bad(slice: &amp;[i32]) -&gt; i32 {
    unsafe { *slice.get_unchecked(0) }
}</code></pre>
</div>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Leaking unsafe through a public API</h3>
<p>Exposing raw pointers or unsafe functions in a public API forces users to write unsafe code and reason about invariants they shouldn't need to know about.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">pub struct Buffer {
    pub ptr: *mut u8, // BAD: raw pointer is public — anyone can misuse it
    pub len: usize,
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">pub struct Buffer {
    ptr: *mut u8, // GOOD: private — only safe methods are exposed
    len: usize,
}

impl Buffer {
    pub fn get(&amp;self, i: usize) -&gt; Option&lt;u8&gt; {
        if i &gt;= self.len { return None; }
        Some(unsafe { *self.ptr.add(i) })
    }
}</code></pre>
</div>

<h3>Mistake 2: Not implementing Drop for types that own raw memory</h3>
<p>If your wrapper allocates memory and does not implement <code>Drop</code>, that memory leaks every time the wrapper is dropped.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BUG: memory allocated in new() is never freed
struct Leaky {
    ptr: *mut i32,
}

impl Leaky {
    fn new(val: i32) -&gt; Self {
        Leaky { ptr: Box::into_raw(Box::new(val)) }
    }
}
// Leaky drops here — but its Drop impl is missing, so heap memory leaks</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: implement Drop to free the memory
impl Drop for Leaky {
    fn drop(&amp;mut self) {
        // SAFETY: ptr was created by Box::into_raw in new()
        unsafe { drop(Box::from_raw(self.ptr)); }
    }
}</code></pre>
</div>
`
  },

  'ch89': {
    moduleNum: 13,
    moduleTitle: 'Unsafe Rust &amp; FFI',
    chNum: 89,
    title: 'Manual Memory Management',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 13 &mdash; Chapter 89</span>
</div>
<h1>Manual Memory Management</h1>

<p>Rust's default memory model is automatic: the compiler inserts allocations and frees via RAII. When a value goes out of scope, it is dropped. When a <code>Box</code> is dropped, its heap memory is freed. This covers 99% of use cases perfectly.</p>

<p>The remaining 1% includes: custom allocators, implementing standard library data structures like <code>Vec</code>, building memory pools for performance, and interfacing with C code that manages memory with explicit <code>malloc</code>/<code>free</code>. For these, Rust exposes its raw memory management primitives.</p>

<h2>Analogy: Self-Storage vs Managed Warehouse</h2>

<p>Using Rust's normal heap (Box, Vec) is like renting space in a managed warehouse: you drop off your goods, they are tracked and eventually removed automatically when you are done. Manual memory management is renting a self-storage unit: you have a key, a locker, and full control. You decide what goes in, what comes out, and you are responsible for emptying it when you are done. Leave it full and you are charged indefinitely (memory leak). Come back to an already-emptied locker and take something out (use-after-free). Open your neighbor's locker (buffer overflow). The power and the risk are yours.</p>

<h2>Box::into_raw and Box::from_raw</h2>

<p>The simplest way to get a raw pointer to heap memory in Rust is via <code>Box</code>. <code>Box::into_raw</code> transfers ownership from the Box to you as a raw pointer. <code>Box::from_raw</code> transfers it back:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    // Allocate an i32 on the heap via Box
    let boxed: Box&lt;i32&gt; = Box::new(99);
    println!("Before into_raw: {}", *boxed);

    // Transfer ownership to a raw pointer.
    // The Box no longer manages this memory — we do.
    let raw: *mut i32 = Box::into_raw(boxed);

    unsafe {
        println!("Via raw pointer: {}", *raw); // 99
        *raw = 200;
        println!("After write: {}", *raw); // 200

        // Transfer ownership back to a Box, which will free memory on drop
        let restored = Box::from_raw(raw);
        println!("Restored Box: {}", *restored); // 200
        // restored drops here, freeing the heap memory
    }
}</code></pre>
</div>

<pre class="output"><code>Before into_raw: 99
Via raw pointer: 99
After write: 200
Restored Box: 200</code></pre>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>After calling <code>Box::into_raw</code>, if you never call <code>Box::from_raw</code> to reclaim ownership, the memory leaks. The Box no longer exists, so nothing will free it.</p>
</div>

<h2>std::alloc: Low-Level Allocation</h2>

<p>The <code>std::alloc</code> module gives direct access to the global allocator (equivalent to C's <code>malloc</code> and <code>free</code>). You must provide a <code>Layout</code> describing the size and alignment of the memory:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::alloc::{alloc, dealloc, Layout};

fn main() {
    unsafe {
        // Describe the memory: size and alignment of i32 (4 bytes, 4-byte aligned)
        let layout = Layout::new::&lt;i32&gt;();

        // Allocate raw memory — returns *mut u8
        let ptr = alloc(layout) as *mut i32;

        if ptr.is_null() {
            panic!("Memory allocation failed");
        }

        // Write a value
        *ptr = 77;
        println!("Allocated i32: {}", *ptr); // 77

        // Deallocate — MUST use the same layout that was passed to alloc
        dealloc(ptr as *mut u8, layout);
        // Do NOT use ptr after this line
    }
}</code></pre>
</div>

<pre class="output"><code>Allocated i32: 77</code></pre>

<h2>Allocating Arrays: Layout::array</h2>

<p>To allocate space for multiple elements of the same type, use <code>Layout::array::&lt;T&gt;(count)</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::alloc::{alloc, dealloc, Layout};

fn main() {
    let count = 5usize;

    unsafe {
        let layout = Layout::array::&lt;f64&gt;(count).unwrap();
        let ptr = alloc(layout) as *mut f64;

        if ptr.is_null() { panic!("allocation failed"); }

        // Initialize each element
        for i in 0..count {
            ptr.add(i).write(i as f64 * 1.5);
        }

        // Read them back
        for i in 0..count {
            print!("{:.1} ", *ptr.add(i));
        }
        println!();

        dealloc(ptr as *mut u8, layout);
    }
}</code></pre>
</div>

<pre class="output"><code>0.0 1.5 3.0 4.5 6.0</code></pre>

<h2>mem::forget: Preventing Drop</h2>

<p><code>std::mem::forget</code> takes ownership of a value and drops it without running its destructor. This is useful when transferring ownership to C code: you hand C a pointer and C is responsible for freeing it. You must stop Rust from also freeing it:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::mem;

struct Noisy {
    id: u32,
}

impl Drop for Noisy {
    fn drop(&amp;mut self) {
        println!("Dropping Noisy({})", self.id);
    }
}

fn main() {
    let a = Noisy { id: 1 };
    let b = Noisy { id: 2 };

    mem::forget(a); // a's destructor will NOT run
    println!("End of main");
    // Only b drops here: "Dropping Noisy(2)"
    // Noisy(1) is forgotten — if it owned heap memory, that memory leaks
}</code></pre>
</div>

<pre class="output"><code>End of main
Dropping Noisy(2)</code></pre>

<h2>ManuallyDrop: Controlled Destruction</h2>

<p><code>std::mem::ManuallyDrop&lt;T&gt;</code> is a wrapper that prevents automatic dropping. Unlike <code>mem::forget</code>, it lets you call the destructor explicitly when you choose:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::mem::ManuallyDrop;

struct Resource { name: &amp;'static str }

impl Drop for Resource {
    fn drop(&amp;mut self) {
        println!("Dropping {}", self.name);
    }
}

fn main() {
    let r1 = Resource { name: "auto" };
    let mut r2 = ManuallyDrop::new(Resource { name: "manual" });

    println!("Before end of scope");
    // r1 drops automatically here: "Dropping auto"
    // r2 does NOT drop automatically

    // We can drop r2 explicitly when we choose:
    unsafe {
        ManuallyDrop::drop(&amp;mut r2);
    }
    println!("After manual drop");
}</code></pre>
</div>

<pre class="output"><code>Before end of scope
Dropping auto
Dropping manual
After manual drop</code></pre>

<h2>std::mem::size_of and align_of</h2>

<p>When doing manual allocation, knowing the size and alignment of a type is essential:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::mem::{size_of, align_of};

fn main() {
    println!("i8:    size={}, align={}", size_of::&lt;i8&gt;(),    align_of::&lt;i8&gt;());
    println!("i32:   size={}, align={}", size_of::&lt;i32&gt;(),   align_of::&lt;i32&gt;());
    println!("i64:   size={}, align={}", size_of::&lt;i64&gt;(),   align_of::&lt;i64&gt;());
    println!("f64:   size={}, align={}", size_of::&lt;f64&gt;(),   align_of::&lt;f64&gt;());
    println!("usize: size={}, align={}", size_of::&lt;usize&gt;(), align_of::&lt;usize&gt;());

    // On a 64-bit system:
    // i8:    size=1, align=1
    // i32:   size=4, align=4
    // i64:   size=8, align=8
    // f64:   size=8, align=8
    // usize: size=8, align=8
}</code></pre>
</div>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Double-free</h3>
<p>Freeing memory that has already been freed is undefined behavior. It often corrupts the allocator's internal state and leads to crashes.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::alloc::{alloc, dealloc, Layout};

fn main() {
    unsafe {
        let layout = Layout::new::&lt;i32&gt;();
        let ptr = alloc(layout) as *mut i32;
        *ptr = 5;

        dealloc(ptr as *mut u8, layout);
        dealloc(ptr as *mut u8, layout); // BUG: double free! undefined behavior
    }
}</code></pre>
</div>

<p>Fix: only free memory once. Set the pointer to null after freeing as a guard.</p>

<h3>Mistake 2: Mismatched Layout in dealloc</h3>
<p>The <code>Layout</code> passed to <code>dealloc</code> must exactly match the one used in <code>alloc</code>. A different size or alignment corrupts the allocator.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::alloc::{alloc, dealloc, Layout};

fn main() {
    unsafe {
        let alloc_layout = Layout::new::&lt;i64&gt;(); // 8 bytes, 8-byte aligned
        let ptr = alloc(alloc_layout);

        let wrong_layout = Layout::new::&lt;i32&gt;(); // BUG: 4 bytes — wrong!
        dealloc(ptr, wrong_layout); // undefined behavior
    }
}</code></pre>
</div>

<p>Fix: store the layout alongside the pointer if you need it later, or reconstruct it with the same type.</p>

<h3>Mistake 3: Forgetting memory intentionally passed to C without tracking it</h3>
<p>When you use <code>Box::into_raw</code> to hand a pointer to C, you must eventually call <code>Box::from_raw</code> to free it (or have C call a Rust destructor function). Forgetting leaks the memory permanently.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BUG: memory allocated here is never freed
fn send_to_c() {
    let data = Box::new(42i32);
    let ptr = Box::into_raw(data);
    unsafe { c_receive_ptr(ptr); }
    // ptr is never passed to Box::from_raw — leak!
}</code></pre>
</div>

<p>Fix: provide a corresponding Rust function (exported with <code>#[no_mangle]</code>) that C can call to free the memory, which internally calls <code>Box::from_raw</code>.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">#[no_mangle]
pub extern "C" fn free_i32(ptr: *mut i32) {
    if ptr.is_null() { return; }
    // SAFETY: ptr was allocated by Rust's Box via send_to_c
    unsafe { drop(Box::from_raw(ptr)); }
}</code></pre>
</div>
`
  }
});
