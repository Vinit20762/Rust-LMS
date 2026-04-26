Object.assign(CHAPTERS_CONTENT, {
  'ch77': {
    moduleNum: 12,
    moduleTitle: 'Async Programming &amp; Tokio',
    chNum: 77,
    title: 'Futures',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 12 &mdash; Chapter 77</span>
</div>
<h1>Futures</h1>

<p>Most programs spend a lot of time <em>waiting</em>: waiting for a network response, a file to load, or a database query to return. The traditional answer is to create one operating system thread per waiting task. That works but threads are expensive. A modern web server handling 10,000 simultaneous connections cannot afford 10,000 threads.</p>

<p>Async programming is the alternative. A single thread can manage thousands of tasks by pausing tasks that are blocked waiting for something and switching to tasks that are ready to make progress. The primitive that makes this possible is the <strong>Future</strong>.</p>

<h2>Analogy: The Restaurant Buzzer</h2>

<p>When you order at a busy counter-service restaurant, the cashier does not make you stand at the counter blocking the line. They hand you a buzzer and tell you to sit down. You can do other things while waiting. When your food is ready, the buzzer vibrates and you go pick it up.</p>

<p>A <code>Future</code> is that buzzer. It is a value that represents a computation that has not finished yet. You get the <code>Future</code> immediately, but the actual result arrives later. While you wait, the runtime (the restaurant kitchen) can handle other orders.</p>

<h2>The Future Trait</h2>

<p>The <code>std::future::Future</code> trait is defined in the standard library. Its simplified form is:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">pub trait Future {
    type Output;
    fn poll(self: Pin&lt;&amp;mut Self&gt;, cx: &amp;mut Context&lt;'_&gt;) -&gt; Poll&lt;Self::Output&gt;;
}</code></pre>
</div>

<dl>
  <dt><code>type Output</code></dt>
  <dd>The type of the value this Future will eventually produce.</dd>
  <dt><code>poll()</code></dt>
  <dd>Called by the runtime to ask: "Are you done yet?" Returns either <code>Poll::Ready(value)</code> or <code>Poll::Pending</code>.</dd>
  <dt><code>Pin&lt;&amp;mut Self&gt;</code></dt>
  <dd>A special reference that guarantees the Future will not be moved in memory. This matters because async state machines can hold self-referential pointers.</dd>
  <dt><code>Context&lt;'_&gt;</code></dt>
  <dd>Holds a <em>Waker</em>, the callback the Future uses to notify the runtime when it is ready to be polled again.</dd>
</dl>

<h2>Poll: Ready or Pending</h2>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">pub enum Poll&lt;T&gt; {
    Ready(T),  // computation finished, here is the result
    Pending,   // not done yet, wake me up when something changes
}</code></pre>
</div>

<p>The runtime calls <code>poll()</code> on a Future. If it returns <code>Ready</code>, the task is complete. If it returns <code>Pending</code>, the Future is put aside until its Waker fires, then it gets polled again.</p>

<h2>Setting Up Tokio</h2>

<p>All runnable async examples in this module require Tokio. Add it to your <code>Cargo.toml</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">toml</span>
  <pre><code class="language-toml">[dependencies]
tokio = { version = "1", features = ["full"] }</code></pre>
</div>

<h2>Writing a Custom Future</h2>

<p>Here is a Future that is always immediately ready, like a vending machine that dispenses instantly:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll};

struct ImmediateFuture {
    value: i32,
}

impl Future for ImmediateFuture {
    type Output = i32;

    fn poll(self: Pin&lt;&amp;mut Self&gt;, _cx: &amp;mut Context&lt;'_&gt;) -&gt; Poll&lt;Self::Output&gt; {
        Poll::Ready(self.value)
    }
}

#[tokio::main]
async fn main() {
    let result = ImmediateFuture { value: 42 }.await;
    println!("Got: {}", result);
}</code></pre>
</div>

<pre class="output"><code>Got: 42</code></pre>

<h2>How async fn Desugars to a Future</h2>

<p>When you write <code>async fn</code>, Rust compiles it into a struct that implements <code>Future</code>. Calling the function does not execute any code inside it. It constructs the state machine. Only <code>.await</code> drives it to completion.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">async fn double(x: i32) -&gt; i32 {
    x * 2
}

#[tokio::main]
async fn main() {
    // Calling double(21) creates a Future. Nothing runs yet.
    let future = double(21);

    // .await drives the Future and gives us the result.
    let result = future.await;
    println!("{}", result); // 42
}</code></pre>
</div>

<pre class="output"><code>42</code></pre>

<h2>Wakers: The Notification Mechanism</h2>

<p>When a Future returns <code>Pending</code>, it must arrange for the Waker to be called when it can make progress. Otherwise the runtime has no way to know when to poll again, and the task hangs forever.</p>

<p>Think of it like leaving a callback number at the restaurant: "Text me when my table is ready." The Future stores the Waker, and when the I/O event or timer fires, it calls <code>waker.wake()</code> to wake the task.</p>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>In practice you will almost never implement <code>Future</code> manually. Tokio provides async timers, network I/O, and channels that handle Wakers internally. You compose them with <code>async fn</code> and <code>.await</code>.</p>
</div>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Calling async fn without .await</h3>
<p>Without <code>.await</code>, you hold a Future value, not the result. The code inside never runs.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">async fn get_answer() -&gt; i32 { 42 }

#[tokio::main]
async fn main() {
    let result = get_answer(); // BUG: result is a Future, not i32
    println!("{}", result);   // compile error
}</code></pre>
</div>

<p>Fix: add <code>.await</code>.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">#[tokio::main]
async fn main() {
    let result = get_answer().await; // correct
    println!("{}", result); // 42
}</code></pre>
</div>

<h3>Mistake 2: Returning Pending without registering the Waker</h3>
<p>A Future that returns <code>Pending</code> without scheduling a wake-up will never be polled again.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BUG: hangs forever - nothing will ever wake this task
fn poll(self: Pin&lt;&amp;mut Self&gt;, _cx: &amp;mut Context&lt;'_&gt;) -&gt; Poll&lt;Self::Output&gt; {
    Poll::Pending
}</code></pre>
</div>

<p>Fix: always call <code>cx.waker().wake_by_ref()</code> or arrange a wake-up before returning <code>Pending</code>.</p>
`
  },

  'ch78': {
    moduleNum: 12,
    moduleTitle: 'Async Programming &amp; Tokio',
    chNum: 78,
    title: 'async/await',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 12 &mdash; Chapter 78</span>
</div>
<h1>async/await</h1>

<p>The previous chapter showed what a <code>Future</code> is under the hood. In practice, you will almost never implement <code>Future</code> manually. Instead, Rust provides two keywords that let you write async code that looks like ordinary synchronous code: <code>async</code> and <code>.await</code>.</p>

<h2>Analogy: The Multi-Tasking Chef</h2>

<p>Imagine a chef cooking three dishes. Instead of standing at the oven waiting for each one to finish, the chef starts dish 1, sets a timer, and starts dish 2. When dish 1's timer goes off, the chef returns to it. This is <em>cooperative multitasking</em>: each task voluntarily pauses at natural waiting points and lets others run.</p>

<p><code>async/await</code> is Rust's way of writing code that cooperates like this chef. Each <code>.await</code> is a point where the current task says: "I'm waiting for something. Go run other tasks and come back when I'm ready."</p>

<h2>The async Keyword</h2>

<p>Putting <code>async</code> before <code>fn</code> transforms the function into one that returns a <code>Future</code>. The body of the function becomes the logic of that Future.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use tokio::time::{sleep, Duration};

// An async function returns a Future that yields a String
async fn fetch_greeting() -&gt; String {
    sleep(Duration::from_millis(100)).await; // simulate a delay
    String::from("Hello, async world!")
}

#[tokio::main]
async fn main() {
    let greeting = fetch_greeting().await;
    println!("{}", greeting);
}</code></pre>
</div>

<pre class="output"><code>Hello, async world!</code></pre>

<h2>The .await Keyword</h2>

<p>The <code>.await</code> suffix on a Future does two things:</p>
<ul>
  <li>It drives the Future toward completion.</li>
  <li>If the Future is not yet ready, it <em>suspends</em> the current task and yields control to the runtime. Other tasks can run. When the Future is ready, this task resumes.</li>
</ul>

<div class="callout">
  <div class="callout-label">Note</div>
  <p><code>.await</code> does <em>not</em> block the thread. The thread remains free to run other tasks. This is the key difference from <code>std::thread::sleep</code> or synchronous I/O, which truly block the thread.</p>
</div>

<h2>Sequential Awaiting</h2>

<p>By default, <code>.await</code> calls run one after another. Each step waits for the previous to finish before starting:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use tokio::time::{sleep, Duration};

async fn step_one() -&gt; i32 {
    sleep(Duration::from_millis(100)).await;
    println!("Step 1 done");
    10
}

async fn step_two(input: i32) -&gt; i32 {
    sleep(Duration::from_millis(100)).await;
    println!("Step 2 done");
    input * 2
}

#[tokio::main]
async fn main() {
    let a = step_one().await;
    let b = step_two(a).await;
    println!("Final result: {}", b);
}</code></pre>
</div>

<pre class="output"><code>Step 1 done
Step 2 done
Final result: 20</code></pre>

<p>Total time: about 200ms (steps run one after another). To run them concurrently, see the chapter on <code>join!</code>.</p>

<h2>async fn in a Struct</h2>

<p>You can use async functions as methods on structs:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use tokio::time::{sleep, Duration};

struct DataLoader {
    delay_ms: u64,
}

impl DataLoader {
    async fn load(&amp;self, id: u32) -&gt; String {
        sleep(Duration::from_millis(self.delay_ms)).await;
        format!("Data for id={}", id)
    }
}

#[tokio::main]
async fn main() {
    let loader = DataLoader { delay_ms: 50 };
    let result = loader.load(7).await;
    println!("{}", result);
}</code></pre>
</div>

<pre class="output"><code>Data for id=7</code></pre>

<h2>Error Handling with ? in async</h2>

<p>The <code>?</code> operator works inside <code>async fn</code> the same way it does in regular functions. The function must return a <code>Result</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::num::ParseIntError;

async fn parse_and_double(s: &amp;str) -&gt; Result&lt;i32, ParseIntError&gt; {
    let n: i32 = s.parse()?; // ? works here
    Ok(n * 2)
}

#[tokio::main]
async fn main() {
    match parse_and_double("21").await {
        Ok(val) =&gt; println!("Result: {}", val),
        Err(e)  =&gt; println!("Error: {}", e),
    }

    match parse_and_double("abc").await {
        Ok(val) =&gt; println!("Result: {}", val),
        Err(e)  =&gt; println!("Error: {}", e),
    }
}</code></pre>
</div>

<pre class="output"><code>Result: 42
Error: invalid digit found in string</code></pre>

<h2>async Closures</h2>

<p>You can pass async closures to functions that expect a <code>Future</code>. The most common form is an <code>async move</code> block, which captures variables by value:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">#[tokio::main]
async fn main() {
    let prefix = String::from("Hello");

    let task = async move {
        // prefix is moved into this async block
        format!("{}, async!", prefix)
    };

    let result = task.await;
    println!("{}", result);
}</code></pre>
</div>

<pre class="output"><code>Hello, async!</code></pre>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Using std::thread::sleep inside async code</h3>
<p>This blocks the entire OS thread, preventing any other async task on that thread from running.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BUG: blocks the thread, starving all other tasks
#[tokio::main]
async fn main() {
    std::thread::sleep(std::time::Duration::from_secs(1)); // wrong
    println!("done");
}</code></pre>
</div>

<p>Fix: use <code>tokio::time::sleep</code>, which yields to the runtime.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use tokio::time::{sleep, Duration};

#[tokio::main]
async fn main() {
    sleep(Duration::from_secs(1)).await; // correct: yields to runtime
    println!("done");
}</code></pre>
</div>

<h3>Mistake 2: Calling async fn from a non-async context</h3>
<p>You cannot use <code>.await</code> outside of an async context. You need an executor to run a Future.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">async fn compute() -&gt; i32 { 42 }

fn main() {
    let result = compute().await; // BUG: cannot .await in a non-async function
}</code></pre>
</div>

<p>Fix: either make <code>main</code> async with <code>#[tokio::main]</code>, or use <code>tokio::runtime::Runtime::block_on</code> (see the Executors chapter).</p>

<h3>Mistake 3: Awaiting inside a sync closure passed to a non-async function</h3>
<p>Regular closures (non-async) cannot use <code>.await</code>. Use an <code>async move</code> block instead.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BUG: closure is not async, cannot .await inside it
let items: Vec&lt;i32&gt; = vec![1, 2, 3];
let results: Vec&lt;_&gt; = items.iter().map(|&amp;x| {
    some_async_fn(x).await // compile error
}).collect();</code></pre>
</div>

<p>Fix: collect the futures first, then await them, or use a loop with async blocks.</p>
`
  },

  'ch79': {
    moduleNum: 12,
    moduleTitle: 'Async Programming &amp; Tokio',
    chNum: 79,
    title: 'Executors',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 12 &mdash; Chapter 79</span>
</div>
<h1>Executors</h1>

<p>You now know what a <code>Future</code> is and how <code>async/await</code> creates them. But a Future on its own does nothing. Like a recipe sitting on a kitchen counter, it describes what should happen but does not cook itself. Something must drive the Future to completion by calling <code>poll()</code>. That something is an <strong>executor</strong>.</p>

<h2>Analogy: The Project Manager</h2>

<p>Picture a project manager overseeing dozens of employees. Each employee is working on a task (a Future). The manager checks in on each person periodically. If someone says "I'm waiting for a report from accounting, come back later," the manager moves on to the next person. When accounting delivers the report, they notify the manager, who goes back to the first employee. The manager never sits idle waiting for one person. The manager is the executor.</p>

<h2>What an Executor Does</h2>

<p>An executor maintains a queue of tasks (Futures). Its job is a loop:</p>

<div class="step">
  <div class="step-num">1</div>
  <div class="step-body"><p>Take a task from the ready queue.</p></div>
</div>
<div class="step">
  <div class="step-num">2</div>
  <div class="step-body"><p>Call <code>poll()</code> on its Future.</p></div>
</div>
<div class="step">
  <div class="step-num">3</div>
  <div class="step-body"><p>If <code>Poll::Ready(val)</code>: the task is done. Remove it.</p></div>
</div>
<div class="step">
  <div class="step-num">4</div>
  <div class="step-body"><p>If <code>Poll::Pending</code>: park the task until its Waker fires, then put it back on the ready queue.</p></div>
</div>
<div class="step">
  <div class="step-num">5</div>
  <div class="step-body"><p>Go to step 1.</p></div>
</div>

<h2>Using the Tokio Runtime Directly</h2>

<p>The <code>#[tokio::main]</code> macro creates a Tokio runtime for you automatically. But you can also create one explicitly with <code>tokio::runtime::Runtime</code>. This is useful when you need async functionality from within a synchronous codebase.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use tokio::runtime::Runtime;

async fn compute(x: i32) -&gt; i32 {
    x * 2
}

fn main() {
    // Build a Tokio runtime
    let rt = Runtime::new().unwrap();

    // block_on drives the Future to completion on this thread
    let result = rt.block_on(compute(21));
    println!("Result: {}", result); // 42
}</code></pre>
</div>

<pre class="output"><code>Result: 42</code></pre>

<h2>What #[tokio::main] Expands To</h2>

<p>The <code>#[tokio::main]</code> attribute is a procedural macro that wraps your async main in a runtime. Understanding this helps you debug runtime errors:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// What you write:
#[tokio::main]
async fn main() {
    println!("Hello");
}

// What it expands to (roughly):
fn main() {
    tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
        .unwrap()
        .block_on(async {
            println!("Hello");
        });
}</code></pre>
</div>

<h2>Single-Threaded vs Multi-Threaded Runtime</h2>

<p>Tokio has two runtime flavors:</p>

<dl>
  <dt>Multi-thread runtime (default)</dt>
  <dd>Uses a thread pool. Tasks can run in parallel across multiple CPU cores. This is what <code>#[tokio::main]</code> creates by default.</dd>
  <dt>Current-thread runtime</dt>
  <dd>All tasks run on the calling thread only. No parallelism, but useful for embedded environments or when you need strict single-thread behavior.</dd>
</dl>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use tokio::runtime::Builder;

async fn greet(name: &amp;str) -&gt; String {
    format!("Hello, {}!", name)
}

fn main() {
    // Single-threaded (current_thread) runtime
    let rt = Builder::new_current_thread()
        .enable_all()
        .build()
        .unwrap();

    let result = rt.block_on(greet("Rust"));
    println!("{}", result);
}

// For multi-thread: Builder::new_multi_thread()</code></pre>
</div>

<pre class="output"><code>Hello, Rust!</code></pre>

<h2>Using block_on in a Library</h2>

<p>If you are writing a library that needs to call async code from a sync context, create a runtime per call:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use tokio::runtime::Runtime;

async fn fetch_data(id: u32) -&gt; String {
    format!("data-{}", id)
}

// A synchronous public API that internally uses async
pub fn get_data(id: u32) -&gt; String {
    let rt = Runtime::new().unwrap();
    rt.block_on(fetch_data(id))
}

fn main() {
    let data = get_data(42);
    println!("{}", data);
}</code></pre>
</div>

<pre class="output"><code>data-42</code></pre>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Calling block_on inside an async context</h3>
<p>Tokio's multi-thread runtime does not allow nesting <code>block_on</code> inside an async task. It panics at runtime.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use tokio::runtime::Runtime;

async fn inner() -&gt; i32 { 42 }

#[tokio::main]
async fn main() {
    let rt = Runtime::new().unwrap();
    // BUG: panics - cannot block inside a Tokio async context
    let val = rt.block_on(inner());
    println!("{}", val);
}</code></pre>
</div>

<p>Fix: just <code>.await</code> inside async code, without creating a new runtime.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">#[tokio::main]
async fn main() {
    let val = inner().await; // correct
    println!("{}", val);
}</code></pre>
</div>

<h3>Mistake 2: Dropping the runtime before Futures complete</h3>
<p>If a <code>Runtime</code> is dropped while tasks are still running, those tasks are cancelled. Always keep the runtime alive for as long as you need its tasks.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use tokio::runtime::Runtime;
use tokio::time::{sleep, Duration};

fn main() {
    let result = {
        let rt = Runtime::new().unwrap();
        rt.spawn(async {
            sleep(Duration::from_secs(1)).await;
            println!("This may never print!");
        });
        // BUG: rt is dropped here, cancelling the spawned task
        "done"
    };
    println!("{}", result);
}</code></pre>
</div>

<p>Fix: call <code>rt.block_on</code> or use a <code>JoinHandle</code> to wait for spawned tasks before the runtime is dropped.</p>
`
  },

  'ch80': {
    moduleNum: 12,
    moduleTitle: 'Async Programming &amp; Tokio',
    chNum: 80,
    title: 'Tokio Runtime',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 12 &mdash; Chapter 80</span>
</div>
<h1>Tokio Runtime</h1>

<p>Tokio is Rust's most widely used async runtime. It provides everything you need for async I/O: a thread pool, async timers, async networking, async file I/O, channels, synchronization primitives, and more. This chapter covers the practical patterns you will use every day when writing async Rust with Tokio.</p>

<h2>Analogy: The Airport Control Tower</h2>

<p>An airport control tower manages dozens of aircraft simultaneously. It does not fly each plane; it coordinates them: telling one to hold, another to land, another to taxi. The planes are your async tasks. The control tower is the Tokio runtime. The tower does not do the actual work, but it makes sure everything proceeds efficiently and nothing collides.</p>

<h2>Project Setup</h2>

<p>Add Tokio to <code>Cargo.toml</code>. The <code>"full"</code> feature set enables all Tokio components:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">toml</span>
  <pre><code class="language-toml">[dependencies]
tokio = { version = "1", features = ["full"] }</code></pre>
</div>

<h2>The #[tokio::main] Entry Point</h2>

<p>This attribute sets up the Tokio runtime and runs your async main function inside it:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">#[tokio::main]
async fn main() {
    println!("Running inside the Tokio runtime!");
}</code></pre>
</div>

<pre class="output"><code>Running inside the Tokio runtime!</code></pre>

<h2>Async Sleep</h2>

<p>Use <code>tokio::time::sleep</code> instead of <code>std::thread::sleep</code>. The async version yields to the runtime instead of blocking the thread:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use tokio::time::{sleep, Duration};

#[tokio::main]
async fn main() {
    println!("Before sleep");
    sleep(Duration::from_millis(500)).await;
    println!("After 500ms");
}</code></pre>
</div>

<pre class="output"><code>Before sleep
After 500ms</code></pre>

<h2>Spawning Tasks</h2>

<p>Spawning creates a new async task that runs concurrently with the current one. Think of it like hiring a contractor: you hand them a job and they work independently while you continue your own work.</p>

<p><code>tokio::spawn</code> returns a <code>JoinHandle</code>. Awaiting the handle waits for the task to finish and retrieves its return value.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use tokio::time::{sleep, Duration};

#[tokio::main]
async fn main() {
    let handle = tokio::spawn(async {
        sleep(Duration::from_millis(200)).await;
        println!("Spawned task done");
        42
    });

    println!("Main task continues while spawned task runs");
    sleep(Duration::from_millis(100)).await;
    println!("Main task did some work");

    // Wait for the spawned task and get its result
    let result = handle.await.unwrap();
    println!("Spawned task returned: {}", result);
}</code></pre>
</div>

<pre class="output"><code>Main task continues while spawned task runs
Main task did some work
Spawned task done
Spawned task returned: 42</code></pre>

<h2>Spawning Multiple Tasks</h2>

<p>A common pattern is to spawn a collection of tasks and then wait for all of them:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use tokio::time::{sleep, Duration};

async fn process(id: u32) -&gt; String {
    sleep(Duration::from_millis(50 * id as u64)).await;
    format!("Task {} finished", id)
}

#[tokio::main]
async fn main() {
    let mut handles = Vec::new();

    for i in 1..=5 {
        let handle = tokio::spawn(process(i));
        handles.push(handle);
    }

    for handle in handles {
        let result = handle.await.unwrap();
        println!("{}", result);
    }
}</code></pre>
</div>

<pre class="output"><code>Task 1 finished
Task 2 finished
Task 3 finished
Task 4 finished
Task 5 finished</code></pre>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>All five tasks run concurrently. The total time is roughly 250ms (the longest task), not 750ms (the sum of all tasks). This is the power of concurrent async execution.</p>
</div>

<h2>Sharing Data Across Tasks with Arc</h2>

<p>Spawned tasks require their captures to be <code>Send + 'static</code>. The standard way to share data across tasks is <code>Arc</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::sync::Arc;
use tokio::time::{sleep, Duration};

#[tokio::main]
async fn main() {
    let config = Arc::new(String::from("production"));

    let mut handles = Vec::new();

    for i in 0..3 {
        let config = Arc::clone(&amp;config);
        let handle = tokio::spawn(async move {
            sleep(Duration::from_millis(10)).await;
            println!("Worker {} using config: {}", i, config);
        });
        handles.push(handle);
    }

    for h in handles {
        h.await.unwrap();
    }
}</code></pre>
</div>

<h2>Tokio's Task vs OS Thread</h2>

<dl>
  <dt>OS Thread</dt>
  <dd>Heavy. Each thread has its own stack (typically 2-8 MB). Context switching is a kernel operation. Practical limit: hundreds to low thousands.</dd>
  <dt>Tokio Task</dt>
  <dd>Lightweight. Each task is a heap-allocated state machine. Context switching is in user space. Practical limit: hundreds of thousands.</dd>
</dl>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Running CPU-heavy work inside a Tokio task</h3>
<p>Tokio's tasks share OS threads. If one task does heavy CPU work without yielding, it blocks the thread for other tasks.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BUG: CPU-bound work blocks the async thread
#[tokio::main]
async fn main() {
    tokio::spawn(async {
        // Heavy computation blocks this thread
        let sum: u64 = (0..1_000_000_000).sum();
        println!("Sum: {}", sum);
    }).await.unwrap();
}</code></pre>
</div>

<p>Fix: use <code>tokio::task::spawn_blocking</code> for CPU-heavy work. It runs the closure on a dedicated blocking thread pool, away from the async thread pool.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">#[tokio::main]
async fn main() {
    let result = tokio::task::spawn_blocking(|| {
        let sum: u64 = (0..1_000_000_000).sum();
        sum
    }).await.unwrap();
    println!("Sum: {}", result);
}</code></pre>
</div>

<h3>Mistake 2: Not awaiting JoinHandle</h3>
<p>Dropping a <code>JoinHandle</code> without awaiting it does not cancel the task, but you lose the ability to get its result or detect panics.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">#[tokio::main]
async fn main() {
    tokio::spawn(async {
        important_work().await;
    });
    // BUG: handle dropped here, task may not finish before main exits
}</code></pre>
</div>

<p>Fix: await the handle, or collect handles and await them before main returns.</p>
`
  },

  'ch81': {
    moduleNum: 12,
    moduleTitle: 'Async Programming &amp; Tokio',
    chNum: 81,
    title: 'Async TCP Server',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 12 &mdash; Chapter 81</span>
</div>
<h1>Async TCP Server</h1>

<p>Network servers are where async shines. A server accepting many simultaneous connections is exactly the kind of workload that benefits from cooperative multitasking: each connection spends most of its time waiting for data, and an async server can handle thousands of connections on just a few threads.</p>

<h2>Analogy: The Phone Switchboard</h2>

<p>An old-fashioned telephone switchboard operator could handle dozens of calls simultaneously. When one caller was put on hold, the operator did not sit there waiting. They plugged in the next caller. When the held caller resumed, the operator switched back. This is exactly how an async TCP server works: each connection is a task, and the runtime switches between them as data arrives.</p>

<h2>Key Tokio Types for TCP</h2>

<dl>
  <dt><code>tokio::net::TcpListener</code></dt>
  <dd>Listens on a port, async version of <code>std::net::TcpListener</code>.</dd>
  <dt><code>tokio::net::TcpStream</code></dt>
  <dd>Represents a connected TCP socket, async version of <code>std::net::TcpStream</code>.</dd>
  <dt><code>tokio::io::AsyncReadExt</code></dt>
  <dd>Trait providing async <code>read()</code> and <code>read_exact()</code> methods.</dd>
  <dt><code>tokio::io::AsyncWriteExt</code></dt>
  <dd>Trait providing async <code>write_all()</code> and <code>flush()</code> methods.</dd>
</dl>

<h2>A Minimal Accept Loop</h2>

<p>Every TCP server follows the same pattern: bind to a port, then loop forever accepting connections:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use tokio::net::TcpListener;

#[tokio::main]
async fn main() {
    let listener = TcpListener::bind("127.0.0.1:8080").await.unwrap();
    println!("Server listening on 127.0.0.1:8080");

    loop {
        let (socket, addr) = listener.accept().await.unwrap();
        println!("New connection from {}", addr);
        // socket is dropped here, connection closes immediately
        drop(socket);
    }
}</code></pre>
</div>

<p>Run this, then in another terminal: <code>telnet 127.0.0.1 8080</code>. You will see the connection message printed.</p>

<h2>Echo Server: Sending Data Back</h2>

<p>An echo server reads whatever a client sends and writes it back. This demonstrates async reading and writing on a <code>TcpStream</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use tokio::net::TcpListener;
use tokio::io::{AsyncReadExt, AsyncWriteExt};

#[tokio::main]
async fn main() {
    let listener = TcpListener::bind("127.0.0.1:8080").await.unwrap();
    println!("Echo server on 127.0.0.1:8080");

    loop {
        let (mut socket, addr) = listener.accept().await.unwrap();
        println!("Connected: {}", addr);

        tokio::spawn(async move {
            let mut buf = vec![0u8; 1024];
            loop {
                let n = match socket.read(&amp;mut buf).await {
                    Ok(0) =&gt; break,       // client disconnected
                    Ok(n) =&gt; n,
                    Err(e) =&gt; {
                        eprintln!("Read error: {}", e);
                        break;
                    }
                };

                if socket.write_all(&amp;buf[..n]).await.is_err() {
                    break;
                }
            }
            println!("Disconnected: {}", addr);
        });
    }
}</code></pre>
</div>

<p>Test with: <code>telnet 127.0.0.1 8080</code>. Anything you type will be echoed back.</p>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>The critical pattern: each accepted connection is handed to <code>tokio::spawn</code> immediately. This returns control to the <code>accept()</code> loop so the server can accept new connections while the current one is being handled. Without spawning, the server would handle only one connection at a time.</p>
</div>

<h2>Splitting a Socket for Independent Read/Write</h2>

<p>Sometimes you want to read and write on the same socket from separate tasks. <code>TcpStream</code> can be split into a read half and write half:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use tokio::net::TcpListener;
use tokio::io::{AsyncReadExt, AsyncWriteExt};

#[tokio::main]
async fn main() {
    let listener = TcpListener::bind("127.0.0.1:8081").await.unwrap();

    let (socket, _addr) = listener.accept().await.unwrap();

    // Split into independent read and write halves
    let (mut reader, mut writer) = socket.into_split();

    let read_task = tokio::spawn(async move {
        let mut buf = vec![0u8; 512];
        let n = reader.read(&amp;mut buf).await.unwrap_or(0);
        buf[..n].to_vec()
    });

    let data = read_task.await.unwrap();
    writer.write_all(&amp;data).await.unwrap();
}</code></pre>
</div>

<h2>Handling Server Shutdown Gracefully</h2>

<p>A real server needs a way to shut down. One approach uses a broadcast channel or a flag. The simplest way to run a server for a fixed time is using <code>tokio::select!</code> (covered in a later chapter). For now, note that <code>Ctrl+C</code> will terminate the process and close all connections.</p>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Handling the connection without spawning</h3>
<p>Without <code>tokio::spawn</code>, the server blocks on the first connection and cannot accept new ones.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">loop {
    let (mut socket, _) = listener.accept().await.unwrap();
    // BUG: this blocks the loop until the client disconnects
    handle_client(&amp;mut socket).await;
}</code></pre>
</div>

<p>Fix: always spawn a new task per connection.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">loop {
    let (socket, _) = listener.accept().await.unwrap();
    tokio::spawn(async move {
        handle_client(socket).await;
    });
}</code></pre>
</div>

<h3>Mistake 2: Not handling Ok(0) from read()</h3>
<p>When <code>read()</code> returns <code>Ok(0)</code>, the client has closed the connection. Ignoring this leads to an infinite loop reading zero bytes.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">let n = socket.read(&amp;mut buf).await.unwrap();
// BUG: if n is 0, client disconnected. We still try to write 0 bytes
// and loop forever.
socket.write_all(&amp;buf[..n]).await.unwrap();</code></pre>
</div>

<p>Fix: check for zero and break the loop.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">let n = match socket.read(&amp;mut buf).await {
    Ok(0) =&gt; break, // client disconnected cleanly
    Ok(n) =&gt; n,
    Err(_) =&gt; break,
};
socket.write_all(&amp;buf[..n]).await.unwrap();</code></pre>
</div>
`
  },

  'ch82': {
    moduleNum: 12,
    moduleTitle: 'Async Programming &amp; Tokio',
    chNum: 82,
    title: 'Async HTTP Server',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 12 &mdash; Chapter 82</span>
</div>
<h1>Async HTTP Server</h1>

<p>HTTP is just text sent over TCP. An HTTP request is a series of lines: a request line, headers, a blank line, and an optional body. An HTTP response is the same structure with a status line instead of a request line. Understanding this lets you build a minimal HTTP server on top of the TCP server from the previous chapter.</p>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>Production HTTP servers use crates like <code>axum</code>, <code>actix-web</code>, or <code>warp</code>. This chapter builds a raw HTTP server to teach how HTTP works at the protocol level. The patterns here are directly applicable to understanding how those frameworks operate underneath.</p>
</div>

<h2>Analogy: The Post Office Window</h2>

<p>Each HTTP request is like a letter arriving at a post office window. The clerk (server) reads the letter, understands what is being asked for ("send me the menu"), prepares a response ("here is the menu"), hands it back, and closes the window. An HTTP/1.1 connection can handle multiple letters in sequence (keep-alive), but for simplicity we will use <code>Connection: close</code> to handle one request per connection.</p>

<h2>The HTTP Protocol in Plain Text</h2>

<p>An HTTP request looks like this (each line ends with <code>\\r\\n</code>):</p>

<pre class="output"><code>GET /about HTTP/1.1\\r\\n
Host: 127.0.0.1:8080\\r\\n
\\r\\n</code></pre>

<p>An HTTP response looks like this:</p>

<pre class="output"><code>HTTP/1.1 200 OK\\r\\n
Content-Length: 12\\r\\n
Connection: close\\r\\n
\\r\\n
Hello, World!</code></pre>

<p>The blank line (<code>\\r\\n</code>) separates headers from the body. This is the key detail many beginners miss.</p>

<h2>Building the Server Step by Step</h2>

<h3>Step 1: Read the Request Line</h3>

<p>The first line of an HTTP request contains the method, path, and HTTP version. We use <code>tokio::io::BufReader</code> to read line by line:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use tokio::net::TcpListener;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};

#[tokio::main]
async fn main() {
    let listener = TcpListener::bind("127.0.0.1:8080").await.unwrap();
    println!("HTTP server at http://127.0.0.1:8080");

    loop {
        let (socket, _) = listener.accept().await.unwrap();
        tokio::spawn(handle_request(socket));
    }
}

async fn handle_request(socket: tokio::net::TcpStream) {
    let mut reader = BufReader::new(socket);

    // Read the first line: "GET /path HTTP/1.1"
    let mut request_line = String::new();
    reader.read_line(&amp;mut request_line).await.unwrap();

    // Drain remaining headers until we see the blank line
    loop {
        let mut header = String::new();
        reader.read_line(&amp;mut header).await.unwrap();
        if header == "\\r\\n" || header.is_empty() {
            break;
        }
    }

    // Parse the path from the request line
    let path = request_line
        .split_whitespace()
        .nth(1)
        .unwrap_or("/")
        .to_string();

    // Route to a handler based on the path
    let (status, body) = route(&amp;path);

    let response = format!(
        "HTTP/1.1 {}\\r\\nContent-Length: {}\\r\\nConnection: close\\r\\n\\r\\n{}",
        status,
        body.len(),
        body
    );

    // Write back through the underlying TcpStream
    reader.get_mut().write_all(response.as_bytes()).await.unwrap();
}

fn route(path: &amp;str) -&gt; (&amp;'static str, &amp;'static str) {
    match path {
        "/"      =&gt; ("200 OK", "Welcome to Rust HTTP!"),
        "/about" =&gt; ("200 OK", "This is a minimal async HTTP server."),
        "/hello" =&gt; ("200 OK", "Hello from Rust!"),
        _        =&gt; ("404 Not Found", "Page not found."),
    }
}</code></pre>
</div>

<p>Test it: run with <code>cargo run</code>, then open <code>http://127.0.0.1:8080</code> in a browser, or use curl:</p>

<pre class="output"><code>$ curl http://127.0.0.1:8080/
Welcome to Rust HTTP!

$ curl http://127.0.0.1:8080/about
This is a minimal async HTTP server.

$ curl http://127.0.0.1:8080/missing
Page not found.</code></pre>

<h2>Serving Dynamic Content</h2>

<p>The response body does not have to be a static string. Here is a handler that generates content based on the request:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use tokio::net::TcpListener;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};

#[tokio::main]
async fn main() {
    let listener = TcpListener::bind("127.0.0.1:8080").await.unwrap();

    loop {
        let (socket, _) = listener.accept().await.unwrap();
        tokio::spawn(async move {
            let mut reader = BufReader::new(socket);
            let mut request_line = String::new();
            reader.read_line(&amp;mut request_line).await.unwrap();

            // Drain headers
            loop {
                let mut h = String::new();
                reader.read_line(&amp;mut h).await.unwrap();
                if h == "\\r\\n" || h.is_empty() { break; }
            }

            let path = request_line
                .split_whitespace()
                .nth(1)
                .unwrap_or("/")
                .to_string();

            // Dynamic route: /greet/Alice returns "Hello, Alice!"
            let body = if path.starts_with("/greet/") {
                let name = &amp;path[7..]; // everything after "/greet/"
                format!("Hello, {}!", name)
            } else {
                format!("Unknown path: {}", path)
            };

            let response = format!(
                "HTTP/1.1 200 OK\\r\\nContent-Length: {}\\r\\nConnection: close\\r\\n\\r\\n{}",
                body.len(),
                body
            );
            reader.get_mut().write_all(response.as_bytes()).await.unwrap();
        });
    }
}</code></pre>
</div>

<pre class="output"><code>$ curl http://127.0.0.1:8080/greet/Ferris
Hello, Ferris!</code></pre>

<h2>Adding JSON Responses</h2>

<p>HTTP APIs commonly return JSON. Without external crates, you can build JSON strings manually for simple structures:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn json_route(path: &amp;str) -&gt; (String, String) {
    match path {
        "/api/status" =&gt; {
            let body = r#"{"status":"ok","version":"1.0"}"#.to_string();
            let response = format!(
                "HTTP/1.1 200 OK\\r\\nContent-Type: application/json\\r\\nContent-Length: {}\\r\\nConnection: close\\r\\n\\r\\n{}",
                body.len(), body
            );
            (response, body)
        }
        _ =&gt; {
            let body = r#"{"error":"not found"}"#.to_string();
            let response = format!(
                "HTTP/1.1 404 Not Found\\r\\nContent-Type: application/json\\r\\nContent-Length: {}\\r\\nConnection: close\\r\\n\\r\\n{}",
                body.len(), body
            );
            (response, body)
        }
    }
}</code></pre>
</div>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Forgetting to drain request headers</h3>
<p>If you send a response without reading all request headers, the client may be confused. Browsers and curl send multiple headers after the request line.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BUG: reads only the first line, ignores the rest of the request
let mut line = String::new();
reader.read_line(&amp;mut line).await.unwrap();
// Sends response immediately; unread headers stay in the socket buffer
// and confuse the next request on keep-alive connections.
reader.get_mut().write_all(b"HTTP/1.1 200 OK\\r\\n\\r\\nHi").await.unwrap();</code></pre>
</div>

<p>Fix: drain headers in a loop until you see the blank line.</p>

<h3>Mistake 2: Missing the blank line between headers and body</h3>
<p>HTTP requires <code>\\r\\n\\r\\n</code> to separate headers from the body. Without it the browser treats everything as headers.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BUG: missing blank line — browser gets no body
let bad = "HTTP/1.1 200 OK\\r\\nContent-Length: 5\\r\\nHello";</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: \\r\\n\\r\\n separates headers from body
let good = "HTTP/1.1 200 OK\\r\\nContent-Length: 5\\r\\n\\r\\nHello";</code></pre>
</div>

<h3>Mistake 3: Not using Content-Length</h3>
<p>Without <code>Content-Length</code>, some HTTP clients do not know where the body ends. Always include it when using <code>Connection: close</code>.</p>
`
  },

  'ch83': {
    moduleNum: 12,
    moduleTitle: 'Async Programming &amp; Tokio',
    chNum: 83,
    title: 'select! and join!',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 12 &mdash; Chapter 83</span>
</div>
<h1>select! and join!</h1>

<p>So far, every <code>.await</code> we have written runs one Future at a time, sequentially. But async programming is most powerful when you run multiple Futures <em>concurrently</em>. Tokio provides two macros for this: <code>join!</code> and <code>select!</code>. They solve different problems and understanding the difference is essential.</p>

<h2>Analogy: Waiting for Multiple Events</h2>

<p>Imagine you ordered food from two different apps simultaneously. <code>join!</code> is like waiting until <em>both</em> deliveries arrive before you start eating. <code>select!</code> is like eating whichever delivery arrives first and cancelling the other.</p>

<h2>tokio::join!: Wait for All</h2>

<p><code>tokio::join!</code> runs multiple Futures concurrently and waits until <em>all</em> of them complete. It returns a tuple of all the results.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use tokio::time::{sleep, Duration};

async fn task_a() -&gt; &amp;'static str {
    sleep(Duration::from_millis(200)).await;
    "A done"
}

async fn task_b() -&gt; &amp;'static str {
    sleep(Duration::from_millis(100)).await;
    "B done"
}

#[tokio::main]
async fn main() {
    // Both tasks run concurrently.
    // Total time: ~200ms (the slower one), not 300ms (sequential).
    let (a, b) = tokio::join!(task_a(), task_b());
    println!("{}", a);
    println!("{}", b);
}</code></pre>
</div>

<pre class="output"><code>A done
B done</code></pre>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>With sequential <code>.await</code>, this would take ~300ms. With <code>join!</code> it takes ~200ms because both tasks run concurrently on the same thread, yielding to each other at each <code>sleep</code>.</p>
</div>

<h2>join! with Error Handling: try_join!</h2>

<p>If any task returns a <code>Result</code>, use <code>tokio::try_join!</code>. It returns as soon as <em>any</em> Future returns an <code>Err</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use tokio::time::{sleep, Duration};

async fn fetch_user(id: u32) -&gt; Result&lt;String, String&gt; {
    sleep(Duration::from_millis(50)).await;
    if id == 0 {
        Err(format!("User {} not found", id))
    } else {
        Ok(format!("User #{}", id))
    }
}

async fn fetch_posts(user_id: u32) -&gt; Result&lt;Vec&lt;String&gt;, String&gt; {
    sleep(Duration::from_millis(80)).await;
    Ok(vec![format!("Post by user {}", user_id)])
}

#[tokio::main]
async fn main() {
    // Succeeds when both return Ok
    match tokio::try_join!(fetch_user(1), fetch_posts(1)) {
        Ok((user, posts)) =&gt; println!("User: {}, Posts: {:?}", user, posts),
        Err(e) =&gt; println!("Error: {}", e),
    }

    // Fails fast when one returns Err
    match tokio::try_join!(fetch_user(0), fetch_posts(0)) {
        Ok((user, posts)) =&gt; println!("User: {}, Posts: {:?}", user, posts),
        Err(e) =&gt; println!("Error: {}", e),
    }
}</code></pre>
</div>

<pre class="output"><code>User: User #1, Posts: ["Post by user 1"]
Error: User 0 not found</code></pre>

<h2>tokio::select!: Take the First</h2>

<p><code>tokio::select!</code> polls multiple Futures simultaneously and completes as soon as <em>one</em> of them is ready. The others are cancelled (dropped).</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use tokio::time::{sleep, Duration};

#[tokio::main]
async fn main() {
    tokio::select! {
        _ = sleep(Duration::from_millis(200)) =&gt; {
            println!("200ms timer fired first");
        }
        _ = sleep(Duration::from_millis(100)) =&gt; {
            println!("100ms timer fired first");
        }
    }
}</code></pre>
</div>

<pre class="output"><code>100ms timer fired first</code></pre>

<p>The 100ms branch wins. The 200ms Future is dropped and never completes.</p>

<h2>select! with Values</h2>

<p>Each branch of <code>select!</code> can capture the value from the winning Future:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use tokio::time::{sleep, Duration};

async fn slow_api() -&gt; String {
    sleep(Duration::from_millis(500)).await;
    String::from("slow result")
}

async fn fast_api() -&gt; String {
    sleep(Duration::from_millis(50)).await;
    String::from("fast result")
}

#[tokio::main]
async fn main() {
    let result = tokio::select! {
        val = slow_api() =&gt; val,
        val = fast_api() =&gt; val,
    };
    println!("Got: {}", result);
}</code></pre>
</div>

<pre class="output"><code>Got: fast result</code></pre>

<h2>Implementing a Timeout with select!</h2>

<p>The timeout pattern is one of the most common uses of <code>select!</code>: race an operation against a timer, and give up if the timer fires first:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use tokio::time::{sleep, Duration};

async fn slow_operation() -&gt; String {
    sleep(Duration::from_secs(5)).await;
    String::from("finally done")
}

#[tokio::main]
async fn main() {
    let timeout = sleep(Duration::from_millis(200));

    tokio::select! {
        result = slow_operation() =&gt; {
            println!("Completed: {}", result);
        }
        _ = timeout =&gt; {
            println!("Operation timed out after 200ms");
        }
    }
}</code></pre>
</div>

<pre class="output"><code>Operation timed out after 200ms</code></pre>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>Tokio also provides <code>tokio::time::timeout(duration, future)</code> as a convenience wrapper around this pattern. But knowing that it is built on <code>select!</code> under the hood helps you understand how it works.</p>
</div>

<h2>select! with Channels</h2>

<p>A common pattern is to select between incoming messages from a channel and a shutdown signal:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use tokio::sync::mpsc;
use tokio::time::{sleep, Duration};

#[tokio::main]
async fn main() {
    let (tx, mut rx) = mpsc::channel::&lt;String&gt;(10);
    let (shutdown_tx, mut shutdown_rx) = mpsc::channel::&lt;()&gt;(1);

    // Send a message after 100ms
    let tx_clone = tx.clone();
    tokio::spawn(async move {
        sleep(Duration::from_millis(100)).await;
        tx_clone.send(String::from("hello")).await.unwrap();
    });

    // Trigger shutdown after 300ms
    tokio::spawn(async move {
        sleep(Duration::from_millis(300)).await;
        shutdown_tx.send(()).await.unwrap();
    });

    loop {
        tokio::select! {
            msg = rx.recv() =&gt; {
                match msg {
                    Some(m) =&gt; println!("Message: {}", m),
                    None    =&gt; break,
                }
            }
            _ = shutdown_rx.recv() =&gt; {
                println!("Shutdown signal received");
                break;
            }
        }
    }
}</code></pre>
</div>

<pre class="output"><code>Message: hello
Shutdown signal received</code></pre>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Using select! when you need both results</h3>
<p><code>select!</code> cancels all non-winning branches. If you need the results of multiple tasks, use <code>join!</code> instead.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BUG: only one result is returned; the other task is cancelled
tokio::select! {
    result = fetch_user_data() =&gt; process(result),
    result = fetch_config() =&gt; apply(result), // may never run!
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: both run to completion
let (user_data, config) = tokio::join!(fetch_user_data(), fetch_config());
process(user_data);
apply(config);</code></pre>
</div>

<h3>Mistake 2: Moving values into select! branches that are also used after</h3>
<p>If a Future in a <code>select!</code> branch moves a variable, that variable cannot be used if a different branch wins.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">let data = String::from("important");

tokio::select! {
    _ = send_data(data) =&gt; {},   // data moved here
    _ = timeout() =&gt; {
        println!("{}", data);    // BUG: data was moved
    }
}</code></pre>
</div>

<p>Fix: clone the data before the <code>select!</code>, or restructure to avoid moving into multiple branches.</p>
`
  },

  'ch84': {
    moduleNum: 12,
    moduleTitle: 'Async Programming &amp; Tokio',
    chNum: 84,
    title: 'Cancellation &amp; Backpressure',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 12 &mdash; Chapter 84</span>
</div>
<h1>Cancellation &amp; Backpressure</h1>

<p>Two important aspects of writing robust async systems are: knowing how to stop work that is no longer needed (cancellation), and knowing how to prevent a fast producer from overwhelming a slow consumer (backpressure). Both are essential for building systems that behave well under load and in error conditions.</p>

<h2>Cancellation: Stopping Work Early</h2>

<h3>Analogy: Cancelling a Pizza Order</h3>

<p>If you order a pizza but then leave the house, you call the restaurant and cancel. The kitchen stops working on your order so it does not waste ingredients. In async Rust, dropping a Future cancels it: the runtime stops driving it forward and all resources it held are freed.</p>

<h3>Cancellation by Dropping</h3>

<p>The simplest cancellation mechanism in async Rust is just dropping a Future. When a Future is dropped, the code inside it stops at the current <code>.await</code> point and is not resumed:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use tokio::time::{sleep, Duration};

async fn long_operation() {
    println!("Starting long operation");
    sleep(Duration::from_secs(10)).await;
    println!("This line never prints if cancelled");
}

#[tokio::main]
async fn main() {
    // select! drops the losing future, cancelling it
    tokio::select! {
        _ = long_operation() =&gt; {
            println!("Operation completed");
        }
        _ = sleep(Duration::from_millis(100)) =&gt; {
            println!("Timed out: long_operation was cancelled");
        }
    }
}</code></pre>
</div>

<pre class="output"><code>Starting long operation
Timed out: long_operation was cancelled</code></pre>

<h3>Aborting a Spawned Task</h3>

<p>For tasks spawned with <code>tokio::spawn</code>, use <code>JoinHandle::abort()</code> to send a cancellation signal:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use tokio::time::{sleep, Duration};

#[tokio::main]
async fn main() {
    let handle = tokio::spawn(async {
        println!("Task started");
        sleep(Duration::from_secs(10)).await;
        println!("Task finished (never reaches here)");
        "done"
    });

    // Let the task start, then abort it
    sleep(Duration::from_millis(50)).await;
    handle.abort();

    match handle.await {
        Ok(val)                    =&gt; println!("Completed: {}", val),
        Err(e) if e.is_cancelled() =&gt; println!("Task was cancelled"),
        Err(e)                     =&gt; println!("Task panicked: {}", e),
    }
}</code></pre>
</div>

<pre class="output"><code>Task started
Task was cancelled</code></pre>

<h3>Writing Cancellation-Safe Code</h3>

<p>A function is <em>cancellation-safe</em> if dropping it at any <code>.await</code> point does not leave shared state inconsistent. This is important for functions used inside <code>select!</code>.</p>

<p>For example, receiving from a channel is cancellation-safe: if the receive is cancelled, no message is lost (it stays in the channel). But a function that does partial writes to a file may not be safe: if cancelled midway, the file is in an inconsistent state.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use tokio::sync::mpsc;
use tokio::time::{sleep, Duration};

#[tokio::main]
async fn main() {
    let (tx, mut rx) = mpsc::channel::&lt;i32&gt;(10);

    tokio::spawn(async move {
        for i in 0..5 {
            tx.send(i).await.unwrap();
            sleep(Duration::from_millis(100)).await;
        }
    });

    // recv() is cancellation-safe: if the select! branch is cancelled,
    // the message stays in the channel and can be received next time.
    loop {
        tokio::select! {
            msg = rx.recv() =&gt; {
                match msg {
                    Some(n) =&gt; println!("Received: {}", n),
                    None    =&gt; { println!("Channel closed"); break; }
                }
            }
            _ = sleep(Duration::from_millis(150)) =&gt; {
                println!("Tick");
            }
        }
    }
}</code></pre>
</div>

<h2>Backpressure: Slowing Down Producers</h2>

<h3>Analogy: The Assembly Line</h3>

<p>Imagine a factory assembly line where robots add parts to a conveyor belt. If the packaging station at the end is slow, parts pile up, overflow onto the floor, and become a safety hazard. The fix is a belt with a fixed number of slots: when the belt is full, the robot <em>stops and waits</em> until there is space. This is backpressure: the producer slows down automatically when the consumer cannot keep up.</p>

<h3>Bounded Channels Enforce Backpressure</h3>

<p>An unbounded channel (<code>mpsc::unbounded_channel()</code>) has no limit. A producer can keep sending and the internal buffer grows without bound, consuming memory until the process crashes. A bounded channel (<code>mpsc::channel(capacity)</code>) blocks the producer when the buffer is full, creating natural backpressure:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use tokio::sync::mpsc;
use tokio::time::{sleep, Duration};

#[tokio::main]
async fn main() {
    // Bounded channel: only 3 items can be buffered at once
    let (tx, mut rx) = mpsc::channel::&lt;u32&gt;(3);

    // Fast producer
    let producer = tokio::spawn(async move {
        for i in 0..8 {
            println!("Sending {}", i);
            tx.send(i).await.unwrap(); // blocks when buffer is full
            println!("Sent {}", i);
        }
    });

    // Slow consumer: takes 100ms per item
    let consumer = tokio::spawn(async move {
        while let Some(val) = rx.recv().await {
            sleep(Duration::from_millis(100)).await;
            println!("Processed {}", val);
        }
    });

    let (r1, r2) = tokio::join!(producer, consumer);
    r1.unwrap();
    r2.unwrap();
}</code></pre>
</div>

<pre class="output"><code>Sending 0
Sent 0
Sending 1
Sent 1
Sending 2
Sent 2
Sending 3
Sent 3
Sending 4
(pauses — buffer full, producer waits)
Processed 0
Sent 4
...</code></pre>

<p>The producer automatically slows down when the buffer fills. The system is self-regulating without any manual rate-limiting code.</p>

<h3>Choosing the Right Channel Capacity</h3>

<dl>
  <dt>Too small (capacity = 1)</dt>
  <dd>Producer and consumer are tightly coupled. High synchronization overhead. Good for strict ordering.</dd>
  <dt>Too large or unbounded</dt>
  <dd>Hides backpressure problems. Memory grows unboundedly under load.</dd>
  <dt>Just right</dt>
  <dd>A small buffer (8-64 items) amortizes burst variance while keeping memory bounded. Profile and tune for your workload.</dd>
</dl>

<h3>Using tokio::sync::Semaphore to Limit Concurrency</h3>

<p>Another form of backpressure limits how many tasks can run at the same time. <code>tokio::sync::Semaphore</code> acts like a pool of permits: each task acquires a permit before running and releases it when done:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::sync::Arc;
use tokio::sync::Semaphore;
use tokio::time::{sleep, Duration};

#[tokio::main]
async fn main() {
    // Only 3 tasks may run at once
    let semaphore = Arc::new(Semaphore::new(3));
    let mut handles = Vec::new();

    for i in 0..10 {
        let sem = Arc::clone(&amp;semaphore);
        let handle = tokio::spawn(async move {
            let _permit = sem.acquire().await.unwrap();
            // Only 3 tasks are inside here at any time
            println!("Task {} running", i);
            sleep(Duration::from_millis(200)).await;
            println!("Task {} done", i);
            // _permit dropped here, releasing the slot
        });
        handles.push(handle);
    }

    for h in handles {
        h.await.unwrap();
    }
}</code></pre>
</div>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Using unbounded channels for producer-consumer pipelines</h3>
<p>Unbounded channels provide no backpressure. A producer that outpaces its consumer will grow the buffer indefinitely.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BUG: no backpressure — memory grows unboundedly under load
let (tx, mut rx) = mpsc::unbounded_channel::&lt;Vec&lt;u8&gt;&gt;();</code></pre>
</div>

<p>Fix: use a bounded channel with a capacity chosen based on your expected burst size.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: bounded channel — producer blocks when buffer is full
let (tx, mut rx) = mpsc::channel::&lt;Vec&lt;u8&gt;&gt;(32);</code></pre>
</div>

<h3>Mistake 2: Not checking if e.is_cancelled() on JoinHandle error</h3>
<p>A <code>JoinHandle</code> returns <code>Err</code> both when the task panics and when it is cancelled. Treating all errors the same causes incorrect behavior.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BUG: treats cancellation as a panic/crash
match handle.await {
    Ok(v) =&gt; println!("result: {}", v),
    Err(_) =&gt; println!("task panicked!"), // wrong for cancellation
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: distinguish cancellation from panic
match handle.await {
    Ok(v)                      =&gt; println!("result: {}", v),
    Err(e) if e.is_cancelled() =&gt; println!("task was cancelled"),
    Err(e)                     =&gt; println!("task panicked: {}", e),
}</code></pre>
</div>

<h3>Mistake 3: Assuming Drop always cancels work instantly</h3>
<p>Dropping a <code>JoinHandle</code> detaches the task but does not abort it. The task keeps running in the background. Only calling <code>handle.abort()</code> or the runtime shutting down actually stops a spawned task.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BUG: this does NOT cancel the task
let handle = tokio::spawn(long_running_task());
drop(handle); // task still runs!

// FIXED: abort explicitly if you want cancellation
let handle = tokio::spawn(long_running_task());
handle.abort();
match handle.await {
    Err(e) if e.is_cancelled() =&gt; {},
    _ =&gt; {}
}</code></pre>
</div>
`
  }
});
