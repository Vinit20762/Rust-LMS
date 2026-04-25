/* ================================================================
   Module 5: Lifetimes & Memory Safety
   Chapters: 27 - 32  (this file covers ch27, ch28)
   ================================================================ */
Object.assign(CHAPTERS_CONTENT, {

  /* ---------------------------------------------------------------
     Chapter 27: Lifetime Annotations
     --------------------------------------------------------------- */
  'ch27': {
    moduleNum: 5,
    moduleTitle: 'Lifetimes & Memory Safety',
    chNum: 27,
    title: 'Lifetime Annotations',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 5 &mdash; Chapter 27</span>
</div>

<h1>Lifetime Annotations</h1>

<p>Every reference in Rust has a <strong>lifetime</strong>: the span of code during which that reference is valid. Most of the time the Rust compiler figures this out on its own through inference, and you never think about it. But sometimes you write a function that takes multiple references and returns one of them, and the compiler cannot determine on its own how long the returned reference will live. In these cases, you must provide a <strong>lifetime annotation</strong> that explicitly describes the relationship between the input and output lifetimes.</p>

<p>Understanding lifetimes is what separates intermediate Rust from advanced Rust. Once you see what lifetime annotations actually mean, they stop looking like syntax noise and start looking like documentation about your code's safety guarantees.</p>

<h2>The Expiry Date Analogy</h2>

<p>Imagine you work in a kitchen that borrows ingredients from two different suppliers. Each batch of ingredients has an expiry date stamped on it. When you combine two batches into a new dish, the dish's expiry date is the earlier of the two. If one batch expires tomorrow and the other expires next week, the dish expires tomorrow. You are not changing how long either batch lasts; you are just labelling the result correctly so nobody serves expired food.</p>

<p>Rust lifetime annotations work exactly the same way. A reference has an inherent expiry based on when the value it points to gets dropped. Annotations do not change when values are dropped. They are labels that tell the compiler: the output's expiry is tied to these inputs. At each call site, the compiler substitutes the concrete lifetime, which is the earlier (shorter) of all the input lifetimes tied together.</p>

<h2>The Borrow Checker Already Tracks Lifetimes</h2>

<p>The borrow checker has been silently checking lifetimes in every chapter of this course. Here is a simple case where it rejects dangling reference code, using its lifetime knowledge:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// This does NOT compile.
fn main() {
    let r;
    {
        let x = 5;
        r = &amp;x;  // r borrows x, whose lifetime is the inner block
    }            // x is dropped here — r would now point to freed memory

    println!("{}", r); // error: x does not live long enough
}</code></pre>
</div>

<p>The compiler sees that <code>x</code>'s lifetime (the inner block) is shorter than <code>r</code>'s lifetime (the outer scope). The reference in <code>r</code> would outlive its referent. This is a lifetime mismatch and Rust rejects it. No annotations were needed here because the lifetimes were obvious from the code structure. The problem arises when lifetimes are not obvious.</p>

<h2>The Problem: When the Compiler Cannot Infer Lifetimes</h2>

<p>Consider a function that returns whichever of two string slices is longer. The function wants to return one of its two input references, but which one depends on the runtime values. The compiler cannot figure out on its own how long the returned reference will live:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// This does NOT compile.
fn longest(x: &amp;str, y: &amp;str) -&gt; &amp;str {
    if x.len() &gt; y.len() {
        x
    } else {
        y
    }
}
// error[E0106]: missing lifetime specifier
// The compiler cannot determine whether the return refers to x or y.</code></pre>
</div>

<p>The compiler is not being overly strict here. It genuinely does not know whether the returned reference comes from <code>x</code> or <code>y</code>, and those two references might have very different lifetimes in the caller. Without knowing which input the return refers to, the compiler cannot check whether the caller uses the return value safely.</p>

<h2>Lifetime Annotation Syntax</h2>

<p>Lifetime parameters start with an apostrophe followed by a short lowercase name. The convention is to start with <code>'a</code>, then <code>'b</code>, and so on. They appear inside angle brackets after the function name, just like generic type parameters:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Reading these type signatures:
// &amp;i32         -- a reference with an inferred lifetime
// &amp;'a i32      -- a reference with explicit lifetime 'a
// &amp;'a mut i32  -- a mutable reference with explicit lifetime 'a

// Functions declare lifetimes in angle brackets, just like type parameters:
// fn foo&lt;'a&gt;(x: &amp;'a str) -&gt; &amp;'a str   -- 'a is a generic lifetime parameter</code></pre>
</div>

<h2>Fixing the longest Function With a Lifetime Annotation</h2>

<p>By adding a generic lifetime parameter <code>'a</code> and using it on all three references (both inputs and the output), we tell the compiler: the returned reference lives for at most as long as both inputs are valid:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn longest&lt;'a&gt;(x: &amp;'a str, y: &amp;'a str) -&gt; &amp;'a str {
    if x.len() &gt; y.len() {
        x
    } else {
        y
    }
}

fn main() {
    let s1 = String::from("long string");
    let s2 = String::from("xy");

    // The compiler substitutes 'a with the shorter of s1's and s2's lifetimes.
    let result = longest(s1.as_str(), s2.as_str());
    println!("Longest: {}", result); // long string
}</code></pre>
</div>

<pre class="output"><code>Longest: long string</code></pre>

<div class="callout">
  <div class="callout-label">What the Annotation Means — and Does Not Mean</div>
  <p>The annotation <code>'a</code> says: "at the call site, substitute <code>'a</code> with the concrete overlap where both <code>x</code> and <code>y</code> are valid — the shorter of the two." It does <strong>not</strong> extend or shorten either lifetime. Values still live exactly as long as they would without any annotation. The annotation is purely a constraint declaration for the borrow checker to verify against.</p>
</div>

<h2>Valid Usage: Both Strings Live Long Enough</h2>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn longest&lt;'a&gt;(x: &amp;'a str, y: &amp;'a str) -&gt; &amp;'a str {
    if x.len() &gt; y.len() { x } else { y }
}

fn main() {
    let string1 = String::from("long string is long");
    {
        let string2 = String::from("xyz");
        // Both string1 and string2 are alive in this block.
        // 'a gets the shorter lifetime (string2's scope).
        // result is used before string2 drops — safe.
        let result = longest(string1.as_str(), string2.as_str());
        println!("Longest: {}", result);
    } // string2 and result both drop here — everything is fine
}</code></pre>
</div>

<pre class="output"><code>Longest: long string is long</code></pre>

<h2>Invalid Usage: Shorter-Lived String Dies Before the Result Is Used</h2>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// This does NOT compile.
fn main() {
    let string1 = String::from("long string is long");
    let result;
    {
        let string2 = String::from("xyz");
        result = longest(string1.as_str(), string2.as_str());
    } // string2 is dropped here

    // result's lifetime is tied to string2 (the shorter input).
    // But string2 is gone — result could be a dangling reference.
    println!("Longest: {}", result); // error: string2 does not live long enough
}</code></pre>
</div>

<p>The borrow checker knows that <code>'a</code> was substituted with the overlap of <code>string1</code> and <code>string2</code>, which is <code>string2</code>'s shorter scope. Since <code>result</code> is used after <code>string2</code>'s scope ends, the borrow checker rejects it. The annotation made the relationship visible; now the borrow checker can verify it.</p>

<h2>Not Every Parameter Needs the Same Lifetime</h2>

<p>If a function always returns its first parameter and never uses the second for output, the second parameter's lifetime is irrelevant to the return type. You can use two separate lifetime parameters:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// x's lifetime 'a affects the return; y's lifetime 'b does not.
fn print_and_return&lt;'a, 'b&gt;(x: &amp;'a str, y: &amp;'b str) -&gt; &amp;'a str {
    println!("also received: {}", y);
    x  // only x is returned, so only 'a matters for the output
}

fn main() {
    let s1 = String::from("hello");
    let result;
    {
        let s2 = String::from("world");
        // s2 has a shorter lifetime, but since only x is returned,
        // that does not constrain result.
        result = print_and_return(s1.as_str(), s2.as_str());
    } // s2 drops — fine because result depends on s1's lifetime, not s2's
    println!("{}", result); // hello
}</code></pre>
</div>

<pre class="output"><code>also received: world
hello</code></pre>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Believing a Lifetime Annotation Can Save a Local Variable from Being Dropped</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: no annotation can make a local outlive its function
fn make_str&lt;'a&gt;() -&gt; &amp;'a str {
    let local = String::from("local data");
    local.as_str()  // error: local is dropped at end of function
                    // Annotating 'a cannot change that.
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: return an owned value when data is created locally
fn make_str() -&gt; String {
    String::from("local data") // ownership transfers to the caller
}

fn main() {
    let s = make_str();
    println!("{}", s);
}</code></pre>
</div>

<h3>Mistake 2: Using 'static to Silence a Lifetime Error</h3>

<p>Beginners sometimes add <code>'static</code> to every lifetime to make errors go away. This almost always hides the real bug and makes APIs unnecessarily restrictive. A <code>'static</code> lifetime means the reference must be valid for the entire program, which heap-allocated runtime data cannot satisfy.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// OVERLY RESTRICTIVE: forces y to be a string literal
fn first&lt;'a&gt;(x: &amp;'a str, _y: &amp;'static str) -&gt; &amp;'a str { x }

// CORRECT: y's lifetime is independent and not 'static
fn first_better&lt;'a, 'b&gt;(x: &amp;'a str, _y: &amp;'b str) -&gt; &amp;'a str { x }</code></pre>
</div>

<h3>Mistake 3: Annotating a Return Lifetime That Cannot Be Satisfied</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: annotation claims 'a but the value returned is local
fn wrong&lt;'a&gt;(x: &amp;'a str) -&gt; &amp;'a str {
    let temp = format!("{} extra", x); // new String on heap
    &amp;temp  // error: temp is dropped at end of function
}

// FIXED: return owned data if you need to create new content
fn correct(x: &amp;str) -&gt; String {
    format!("{} extra", x)
}

fn main() {
    let s = correct("hello");
    println!("{}", s); // hello extra
}</code></pre>
</div>
`
  },

  /* ---------------------------------------------------------------
     Chapter 28: Lifetime Elision Rules
     --------------------------------------------------------------- */
  'ch28': {
    moduleNum: 5,
    moduleTitle: 'Lifetimes & Memory Safety',
    chNum: 28,
    title: 'Lifetime Elision Rules',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 5 &mdash; Chapter 28</span>
</div>

<h1>Lifetime Elision Rules</h1>

<p>In Chapter 27, you added <code>'a</code> annotations to the <code>longest</code> function because the compiler could not infer which input lifetime the output depends on. But back in Chapter 24, you wrote <code>fn first_word(s: &amp;str) -&gt; &amp;str</code> with no annotations at all and it compiled fine. Why does one function need annotations and the other does not?</p>

<p>Early versions of Rust required explicit lifetime annotations on every reference in every function signature. This was extremely verbose. The team identified a small set of patterns that covered the vast majority of real-world code and encoded them as three inference rules called <strong>lifetime elision rules</strong>. When these rules can uniquely determine all lifetimes, you can omit annotations entirely. When they cannot, the compiler asks you to annotate explicitly.</p>

<h2>The Smart Auto-Fill Analogy</h2>

<p>Think of filling out a web form with multiple address fields. If you have only entered one address in the form, a smart auto-fill system knows that all address-related fields must refer to that one address. It fills them in for you. But if you have entered two different addresses (say, billing and shipping), it cannot auto-fill the delivery destination field, because it is ambiguous which address you mean. You must select one explicitly.</p>

<p>Lifetime elision works the same way. If the lifetime relationships are obvious from the structure of the function signature, the compiler fills them in. If they are ambiguous, the compiler stops and asks you to annotate explicitly.</p>

<h2>Input Lifetimes and Output Lifetimes</h2>

<dl>
  <dt>Input lifetime</dt>
  <dd>A lifetime on a reference in a function's parameter list.</dd>
  <dt>Output lifetime</dt>
  <dd>A lifetime on a reference in a function's return type.</dd>
</dl>

<p>The elision rules work in sequence: the compiler applies Rule 1, then Rule 2, then Rule 3. If all output lifetimes are assigned after these three passes, elision succeeds. If any output lifetime is still unassigned after Rule 3, the compiler requires explicit annotations.</p>

<h2>Rule 1: Each Input Reference Gets Its Own Lifetime</h2>

<p>Every reference parameter that omits a lifetime annotation is given its own distinct lifetime parameter. This rule assigns names internally; it does not help resolve output lifetimes on its own, but it sets up Rules 2 and 3.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// What you write:
fn print_val(x: &amp;i32) { println!("{}", x); }
fn add_refs(x: &amp;i32, y: &amp;i32) -&gt; i32 { x + y }

// What Rule 1 makes the compiler see internally:
fn print_val&lt;'a&gt;(x: &amp;'a i32) { println!("{}", x); }
fn add_refs&lt;'a, 'b&gt;(x: &amp;'a i32, y: &amp;'b i32) -&gt; i32 { x + y }</code></pre>
</div>

<p>For <code>print_val</code> and <code>add_refs</code>, the return type has no reference, so there is no output lifetime to assign. The rules finish here. No annotation needed.</p>

<h2>Rule 2: One Input Lifetime Propagates to All Outputs</h2>

<p>If after Rule 1 there is exactly one distinct input lifetime (one reference parameter), that lifetime is automatically assigned to all output lifetime positions. This is the most commonly triggered rule:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// What you write (from Chapter 24):
fn first_word(s: &amp;str) -&gt; &amp;str {
    let bytes = s.as_bytes();
    for (i, &amp;byte) in bytes.iter().enumerate() {
        if byte == b' ' { return &amp;s[0..i]; }
    }
    &amp;s[..]
}

// Step 1 — Rule 1 assigns lifetime 'a to s:
//   fn first_word&lt;'a&gt;(s: &amp;'a str) -&gt; &amp;str

// Step 2 — Rule 2: exactly one input lifetime, assign to output:
//   fn first_word&lt;'a&gt;(s: &amp;'a str) -&gt; &amp;'a str
//
// Elision succeeds. You wrote no annotations, but the compiler
// treats the function as if it had the explicit version above.</code></pre>
</div>

<p>Because <code>first_word</code> has exactly one input reference, Rule 2 unambiguously connects the output lifetime to it. No annotation needed. This is why you have been writing functions like this since Chapter 24 with no lifetime syntax at all.</p>

<h2>Rule 3: &amp;self Methods — Self's Lifetime Goes to the Output</h2>

<p>If one of the input parameters is <code>&amp;self</code> or <code>&amp;mut self</code>, the lifetime of <code>self</code> is assigned to all unresolved output lifetimes. Most struct methods return references to fields inside <code>self</code>, so Rule 3 covers them automatically:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">struct Config {
    host: String,
    port: u16,
}

impl Config {
    // What you write:
    fn host(&amp;self) -&gt; &amp;str {
        &amp;self.host
    }

    // Rule 1: self gets 'a, no other reference params.
    // Rule 2: does NOT apply — &amp;self counts, but there are
    //         no additional output-specific rules from one input.
    // Rule 3: &amp;self is present; its lifetime 'a goes to output.
    // Final form seen by compiler:
    //   fn host&lt;'a&gt;(&amp;'a self) -&gt; &amp;'a str { &amp;self.host }

    fn describe(&amp;self) -&gt; &amp;str {
        &amp;self.host  // Rule 3 handles this too
    }
}

fn main() {
    let cfg = Config { host: String::from("localhost"), port: 8080 };
    println!("host: {}", cfg.host());
    println!("desc: {}", cfg.describe());
}</code></pre>
</div>

<pre class="output"><code>host: localhost
desc: localhost</code></pre>

<h2>When Elision Fails: Two Inputs With an Output Reference</h2>

<p>If after all three rules there are still output lifetimes without an assignment, elision fails and the compiler requires explicit annotations. The classic failure case is a function with two input references and one output reference, with no <code>self</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// This does NOT compile without annotations.
//
// After Rule 1: x gets 'a, y gets 'b. Two input lifetimes.
// After Rule 2: does NOT apply — two input lifetimes, not one.
// After Rule 3: does NOT apply — no &amp;self.
// Output lifetime still unassigned. Compiler asks for annotation.
fn pick(x: &amp;str, y: &amp;str) -&gt; &amp;str {
    if x.len() &gt; 0 { x } else { y }
}

// FIXED: explicitly tie the output to both inputs
fn pick&lt;'a&gt;(x: &amp;'a str, y: &amp;'a str) -&gt; &amp;'a str {
    if x.len() &gt; 0 { x } else { y }
}

fn main() {
    let a = String::from("first");
    let b = String::from("second");
    println!("{}", pick(&amp;a, &amp;b)); // first
}</code></pre>
</div>

<pre class="output"><code>first</code></pre>

<h2>Elided vs Explicit Forms Side By Side</h2>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// These pairs are equivalent. The compiler sees the explicit form
// even when you write the elided form.

// Single input reference, output: Rule 2 applies.
fn pass_through(s: &amp;str) -&gt; &amp;str { s }
// Explicit: fn pass_through&lt;'a&gt;(s: &amp;'a str) -&gt; &amp;'a str { s }

// Method returning self field: Rule 3 applies.
struct Wrapper(String);
impl Wrapper {
    fn inner(&amp;self) -&gt; &amp;str { &amp;self.0 }
    // Explicit: fn inner&lt;'a&gt;(&amp;'a self) -&gt; &amp;'a str { &amp;self.0 }
}

// No output reference: no elision needed regardless of input count.
fn log(a: &amp;str, b: &amp;str) { println!("{} {}", a, b); }
// Explicit: fn log&lt;'a, 'b&gt;(a: &amp;'a str, b: &amp;'b str) { ... }</code></pre>
</div>

<h2>Method With &amp;self and Another Reference Input</h2>

<p>When a method has both <code>&amp;self</code> and another reference parameter, Rule 3 still applies — the output gets <code>self</code>'s lifetime. But if the output should depend on the <em>other</em> parameter instead, you must annotate explicitly:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">struct Announcer {
    prefix: String,
}

impl Announcer {
    // Rule 3 applies: output gets self's lifetime.
    // Works because we return a slice of self.prefix.
    fn announce(&amp;self, _msg: &amp;str) -&gt; &amp;str {
        &amp;self.prefix
    }

    // If we want to return the incoming message instead,
    // we must annotate explicitly (output depends on msg, not self).
    fn echo&lt;'a&gt;(&amp;self, msg: &amp;'a str) -&gt; &amp;'a str {
        msg
    }
}

fn main() {
    let a = Announcer { prefix: String::from("[INFO]") };
    println!("{}", a.announce("hello"));       // [INFO]
    println!("{}", a.echo("custom message")); // custom message
}</code></pre>
</div>

<pre class="output"><code>[INFO]
custom message</code></pre>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Expecting Elision to Work With Two Input References</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: two reference inputs block Rule 2; no &amp;self blocks Rule 3.
fn select(a: &amp;str, b: &amp;str) -&gt; &amp;str {
    if a.is_empty() { b } else { a }
}
// error: missing lifetime specifier</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: add explicit lifetime tying both inputs to the output
fn select&lt;'a&gt;(a: &amp;'a str, b: &amp;'a str) -&gt; &amp;'a str {
    if a.is_empty() { b } else { a }
}

fn main() {
    let x = String::from("hello");
    let y = String::from("fallback");
    println!("{}", select(&amp;x, &amp;y)); // hello
    println!("{}", select("", &amp;y));  // fallback
}</code></pre>
</div>

<h3>Mistake 2: Adding Unnecessary Annotations to Simple Methods</h3>

<p>When Rule 3 applies (output comes from self), no annotation is needed. Adding explicit annotations makes the code noisier without benefit:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">struct Name(String);

// UNNECESSARY: Rule 3 handles this automatically
impl Name {
    fn get&lt;'a&gt;(&amp;'a self) -&gt; &amp;'a str { &amp;self.0 }
}

// IDIOMATIC: let elision do its job
impl Name {
    fn get(&amp;self) -&gt; &amp;str { &amp;self.0 }
}</code></pre>
</div>

<h3>Mistake 3: Misreading Rule 2 as Applying to Any Single Reference</h3>

<p>Rule 2 requires exactly one input lifetime position <em>total</em>. A function with one reference parameter and a non-reference parameter still has only one input lifetime — so Rule 2 applies. But a non-reference parameter does not count as a lifetime position at all:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Rule 2 applies here: only one reference input (s).
// n: usize is not a reference and contributes no lifetime.
fn take_n(s: &amp;str, n: usize) -&gt; &amp;str {
    let end = s.len().min(n);
    &amp;s[..end]
}

// Rule 2 does NOT apply here: two reference inputs.
// Must annotate.
fn take_n_or_other&lt;'a&gt;(s: &amp;'a str, other: &amp;'a str, n: usize) -&gt; &amp;'a str {
    if n &lt; s.len() { s } else { other }
}

fn main() {
    let s = String::from("hello world");
    println!("{}", take_n(&amp;s, 5));              // hello
    println!("{}", take_n_or_other(&amp;s, "!", 5)); // hello world
}</code></pre>
</div>

<pre class="output"><code>hello
hello world</code></pre>
`
  },

});
