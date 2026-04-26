Object.assign(QUIZZES, {
  'ch77': {
    title: 'Chapter 77 Quiz: Futures',
    questions: [
      {
        q: 'What does calling an async function in Rust actually return before you use .await?',
        options: [
          'The final result value immediately',
          'A Future — a value representing the pending computation',
          'A thread handle for the background computation',
          'Nothing — calling an async function runs it synchronously'
        ],
        answer: 1,
        explanation: 'Calling an async function constructs a Future state machine but does not execute any of its code. The code only runs when the Future is driven by an executor via .await or poll().'
      },
      {
        q: 'Which variant does poll() return when a Future has finished its computation?',
        options: [
          'Poll::Done(value)',
          'Poll::Complete',
          'Poll::Ready(value)',
          'Poll::Finished(value)'
        ],
        answer: 2,
        explanation: 'The Poll enum has exactly two variants: Poll::Ready(T) for completion, and Poll::Pending to indicate the Future needs more time.'
      },
      {
        q: 'What is the Waker in a Future\'s Context used for?',
        options: [
          'To print debug information when a Future is polled',
          'To notify the executor that the Future is ready to make progress again after returning Poll::Pending',
          'To wake up the OS thread sleeping in the runtime',
          'To cancel all other pending Futures when this one completes'
        ],
        answer: 1,
        explanation: 'When a Future returns Poll::Pending, it must arrange for cx.waker().wake() to be called when it can make progress. This signals the executor to poll the Future again.'
      },
      {
        q: 'Why does the poll() method take Pin<&mut Self> instead of a plain &mut Self?',
        options: [
          'Because Pin<&mut Self> gives better performance than &mut Self',
          'Because async state machines may hold self-referential pointers and must not be moved in memory',
          'Because it is required by the Rust orphan rules for trait implementations',
          'Because &mut Self would allow the executor to clone the Future'
        ],
        answer: 1,
        explanation: 'The compiler-generated async state machine can contain references to its own fields. Moving it in memory would invalidate those pointers. Pin prevents the value from being moved.'
      },
      {
        q: 'A custom Future\'s poll() returns Poll::Pending but never calls cx.waker().wake() or stores the Waker anywhere. What happens?',
        options: [
          'The executor will poll it again after a fixed timeout',
          'The Future will complete with a default value',
          'The task hangs forever — the executor has no way to know when to poll again',
          'The runtime panics with a "stuck future" error'
        ],
        answer: 2,
        explanation: 'Wakers are the only mechanism for a Future to signal readiness. Without storing and later calling the Waker, the task is parked indefinitely and never resumed.'
      }
    ]
  },

  'ch78': {
    title: 'Chapter 78 Quiz: async/await',
    questions: [
      {
        q: 'What is the effect of the .await keyword on a Future inside an async function?',
        options: [
          'It immediately polls the Future to completion, blocking the thread',
          'It suspends the current task at this point, allows other tasks to run, and resumes when the Future is ready',
          'It spawns the Future on a new OS thread',
          'It converts the Future into a synchronous value by calling poll() once'
        ],
        answer: 1,
        explanation: '.await is a suspension point. The current task yields control to the runtime when the Future is Pending. The thread is free to run other tasks. The task resumes when the Future produces Poll::Ready.'
      },
      {
        q: 'You have two async functions: step_a() takes 100ms and step_b() takes 100ms. If you write `step_a().await; step_b().await;` how long does the whole thing take?',
        options: [
          'About 100ms — they run concurrently',
          'About 200ms — they run sequentially, one after the other',
          'About 50ms — .await optimises sequential futures',
          'It depends on the number of CPU cores'
        ],
        answer: 1,
        explanation: 'Sequential .await runs one Future to completion before starting the next. To run them concurrently and finish in ~100ms, you would use tokio::join!(step_a(), step_b()).'
      },
      {
        q: 'Why should you use tokio::time::sleep instead of std::thread::sleep inside async code?',
        options: [
          'Because std::thread::sleep panics inside async functions',
          'Because std::thread::sleep blocks the entire OS thread, preventing any other async task from running on that thread',
          'Because tokio::time::sleep is always faster',
          'Because async functions cannot import from the std library'
        ],
        answer: 1,
        explanation: 'tokio::time::sleep returns a Future that yields to the runtime while waiting, letting other tasks run. std::thread::sleep blocks the OS thread entirely, starving all other async tasks on that thread.'
      },
      {
        q: 'Inside an async fn that returns Result<T, E>, what does the ? operator do?',
        options: [
          'It awaits the inner expression automatically',
          'It early-returns Err(...) from the async function if the expression is Err, exactly as in synchronous code',
          'It converts any error to a string and panics',
          'It is not allowed inside async functions'
        ],
        answer: 1,
        explanation: 'The ? operator works identically in async and sync functions. It evaluates to the Ok value on success, or returns Err early from the surrounding async fn on failure.'
      },
      {
        q: 'What is an async move block?',
        options: [
          'An async function that returns a Move type',
          'A block that is async and captures variables from its surrounding scope by ownership (moving them in)',
          'A block that moves data between async tasks through a channel',
          'A block that runs the async code on a different thread by moving the execution'
        ],
        answer: 1,
        explanation: 'async move { ... } is an async block that takes ownership of the variables it captures. This satisfies the \'static lifetime requirement needed for tokio::spawn, which requires that spawned tasks own all their data.'
      }
    ]
  },

  'ch79': {
    title: 'Chapter 79 Quiz: Executors',
    questions: [
      {
        q: 'What is the primary responsibility of an async executor?',
        options: [
          'To compile async functions into efficient machine code',
          'To repeatedly call poll() on Futures and schedule them based on Waker notifications',
          'To allocate memory for each Future\'s stack frame',
          'To convert async code to multi-threaded synchronous code automatically'
        ],
        answer: 1,
        explanation: 'An executor maintains a queue of tasks, calls poll() on each ready task, parks tasks that return Pending, and re-queues them when their Waker fires.'
      },
      {
        q: 'What does tokio::runtime::Runtime::block_on(future) do?',
        options: [
          'It spawns the Future on a background thread and returns immediately',
          'It drives the given Future to completion on the current thread, blocking until done',
          'It blocks the Future from running until the runtime is idle',
          'It converts an async Future into a synchronous iterator'
        ],
        answer: 1,
        explanation: 'block_on creates a temporary execution context and drives the Future to completion synchronously, returning the result. This is how you bridge from sync code into the async world.'
      },
      {
        q: 'What happens if you call Runtime::block_on() from inside a task already running on a Tokio multi-thread runtime?',
        options: [
          'It works fine — nested block_on calls are supported',
          'The inner Future is queued and runs after the outer task completes',
          'It panics at runtime with an error about nested runtimes',
          'The outer runtime pauses and the inner block_on takes over'
        ],
        answer: 2,
        explanation: 'Tokio\'s multi-thread runtime does not support calling block_on from within an existing async context. Doing so panics. Inside async code, always use .await instead.'
      },
      {
        q: 'What is the difference between the multi_thread and current_thread Tokio runtime flavors?',
        options: [
          'multi_thread uses async I/O; current_thread uses synchronous I/O',
          'multi_thread uses a thread pool so tasks can run in parallel; current_thread runs all tasks on one thread with no parallelism',
          'current_thread is faster because it avoids context switching between CPU cores',
          'multi_thread is only available on Linux; current_thread works on all platforms'
        ],
        answer: 1,
        explanation: 'multi_thread (the default) spawns a pool of OS threads for true parallelism. current_thread runs all tasks cooperatively on a single thread, which is simpler and uses less memory but provides no CPU parallelism.'
      },
      {
        q: 'Why might you create a Runtime manually (Runtime::new()) instead of using #[tokio::main]?',
        options: [
          'Because #[tokio::main] only works on Linux',
          'To integrate async functionality into a larger synchronous codebase or library where you control the runtime lifetime explicitly',
          'Because the macro version is slower due to extra overhead',
          'To use features of Tokio that are not available through the macro'
        ],
        answer: 1,
        explanation: 'Libraries that expose a synchronous public API but use async internally need a Runtime they can create and manage themselves. #[tokio::main] only works on the main function, not inside library code.'
      }
    ]
  },

  'ch80': {
    title: 'Chapter 80 Quiz: Tokio Runtime',
    questions: [
      {
        q: 'Which Cargo.toml entry correctly adds Tokio with all features enabled?',
        options: [
          '`tokio = "1"`',
          '`tokio = { version = "1", features = ["full"] }`',
          '`tokio = { version = "1", all_features = true }`',
          '`tokio = { version = "latest" }`'
        ],
        answer: 1,
        explanation: 'The features field in Cargo.toml must list specific feature strings. "full" is a convenience feature in Tokio that enables all optional components including networking, time, and sync primitives.'
      },
      {
        q: 'What does tokio::spawn return?',
        options: [
          'The result of the async block immediately',
          'A JoinHandle<T> where T is the return type of the spawned async block',
          'A thread ID for the OS thread running the task',
          'A Future<Output = ()> that resolves when all tasks complete'
        ],
        answer: 1,
        explanation: 'tokio::spawn returns a JoinHandle<T>. You can .await the handle to wait for the task and retrieve its return value, or drop the handle to let the task run independently.'
      },
      {
        q: 'Why is it necessary to use Arc when sharing data across tokio::spawn tasks?',
        options: [
          'Because tokio::spawn requires all captured types to implement Clone',
          'Because spawned tasks must be \'static (not borrow local variables), and Arc gives each task shared ownership of heap data',
          'Because Rc is faster but only works on single-threaded runtimes',
          'Because without Arc, the borrow checker would allow two tasks to mutate data simultaneously'
        ],
        answer: 1,
        explanation: 'Spawned tasks have a \'static lifetime requirement — they cannot borrow from the spawner\'s stack. Arc provides multiple ownership of heap-allocated data with atomic reference counting, satisfying both the \'static and Send requirements.'
      },
      {
        q: 'A Tokio task performs a 5-second computation using a tight loop over 10 billion numbers. What is the best way to handle this?',
        options: [
          'Use tokio::time::yield_now() at every iteration to let other tasks run',
          'Move the computation to tokio::task::spawn_blocking so it runs on a dedicated blocking thread pool',
          'Increase the Tokio thread pool size with TOKIO_WORKER_THREADS=100',
          'Wrap the computation in an Arc<Mutex<T>> to prevent thread contention'
        ],
        answer: 1,
        explanation: 'CPU-bound work inside a Tokio async task blocks the worker thread for all other tasks. spawn_blocking offloads it to a separate thread pool designed for blocking operations, keeping the async thread pool free.'
      },
      {
        q: 'You spawn 5 tasks that each sleep for a different duration (100ms to 500ms). How long does the total execution take if you await all their JoinHandles sequentially?',
        options: [
          'About 1500ms — the sum of all durations, since they run one at a time',
          'About 500ms — the longest duration, since all tasks run concurrently',
          'About 100ms — the shortest duration, since the first to complete finishes everything',
          'It depends on the order the handles are awaited'
        ],
        answer: 1,
        explanation: 'tokio::spawn starts all tasks concurrently. They all run at the same time. The longest task (500ms) determines the total wall-clock time. Awaiting the handles just waits for already-running tasks — it does not make them sequential.'
      }
    ]
  },

  'ch81': {
    title: 'Chapter 81 Quiz: Async TCP Server',
    questions: [
      {
        q: 'What does TcpListener::bind("127.0.0.1:8080").await do?',
        options: [
          'It connects to a remote server at that address',
          'It allocates a socket and begins listening for incoming connections on that address and port',
          'It spawns a background task that handles all connections automatically',
          'It reserves the port for future use but does not start listening yet'
        ],
        answer: 1,
        explanation: 'bind() creates a TCP socket bound to the given address and port and starts listening for connections. The .await is needed because the OS operation is asynchronous in Tokio.'
      },
      {
        q: 'What does listener.accept().await return?',
        options: [
          'A bool indicating whether a connection was accepted',
          'A TcpStream connected to the first client in the queue',
          'A (TcpStream, SocketAddr) tuple: the connected socket and the remote address',
          'A Vec<TcpStream> with all pending connections'
        ],
        answer: 2,
        explanation: 'accept() waits until a client connects, then returns a tuple: the TcpStream for that connection and the SocketAddr (IP and port) of the remote client.'
      },
      {
        q: 'Why must each accepted connection be handled inside a tokio::spawn call?',
        options: [
          'Because TcpStream is not Send and cannot cross await points without spawning',
          'Because without spawning, the server handles one connection at a time — new clients must wait until the current one disconnects',
          'Because tokio::spawn is the only way to use AsyncReadExt on a TcpStream',
          'Because the borrow checker requires each TcpStream to have its own task for lifetime reasons'
        ],
        answer: 1,
        explanation: 'Without spawning, the accept loop blocks inside handle_client() and cannot call accept() again. With tokio::spawn, each connection runs as an independent concurrent task and the accept loop is immediately available for new connections.'
      },
      {
        q: 'When socket.read(&mut buf).await returns Ok(0), what does this mean?',
        options: [
          'The buffer was full and no data could be read',
          'The operation timed out after 0 milliseconds',
          'The client cleanly closed the connection (end of stream)',
          'An empty packet was received and should be acknowledged'
        ],
        answer: 2,
        explanation: 'In TCP, Ok(0) from a read means the remote side has shut down the write half of the connection — it will send no more data. This is the normal signal to stop reading and close the connection.'
      },
      {
        q: 'What is socket.into_split() used for in Tokio?',
        options: [
          'It splits one TcpStream into two separate TCP connections',
          'It divides the socket buffer into read and write halves for better performance',
          'It creates independent OwnedReadHalf and OwnedWriteHalf so separate tasks can read and write concurrently without sharing the socket',
          'It converts a TcpStream into a UDP socket for bidirectional communication'
        ],
        answer: 2,
        explanation: 'into_split() splits a TcpStream into two owned halves that can be moved into separate tasks. This is useful when you want one task handling incoming data and another sending outgoing data on the same connection.'
      }
    ]
  },

  'ch82': {
    title: 'Chapter 82 Quiz: Async HTTP Server',
    questions: [
      {
        q: 'What separates the headers from the body in an HTTP response?',
        options: [
          'A single newline character (\\n)',
          'The string "END HEADERS"',
          'A blank line consisting of \\r\\n\\r\\n (two consecutive CRLF pairs)',
          'A Content-Length header with the value 0'
        ],
        answer: 2,
        explanation: 'HTTP requires CRLF (\\r\\n) line endings. A blank line (\\r\\n alone on a line, making \\r\\n\\r\\n in total) signals the end of headers. Without it, the client cannot determine where headers end and body begins.'
      },
      {
        q: 'Why should a minimal HTTP server drain all request headers before sending a response?',
        options: [
          'Because headers contain authentication tokens that must be processed',
          'Because unread header bytes remain in the socket buffer and can confuse subsequent requests or the client\'s parser',
          'Because the Content-Length header must be read to know how large the response body should be',
          'Because Tokio\'s BufReader will panic if unread data is left in the buffer'
        ],
        answer: 1,
        explanation: 'HTTP is a text protocol. If you respond without reading all incoming headers, the unread bytes (from the browser) stay in the socket buffer. On keep-alive connections this breaks the next request; even on close connections it can confuse some clients.'
      },
      {
        q: 'In the line `reader.get_mut().write_all(response.as_bytes()).await`, what does reader.get_mut() return?',
        options: [
          'A new TcpStream cloned from the original',
          'A &mut TcpStream — a mutable reference to the inner stream inside the BufReader',
          'A MutexGuard protecting the BufReader\'s internal buffer',
          'A WriteHalf split from the original TcpStream'
        ],
        answer: 1,
        explanation: 'BufReader::get_mut() returns a mutable reference to the inner reader/writer (in this case TcpStream). Since TcpStream implements AsyncWrite, you can call write_all on it directly.'
      },
      {
        q: 'Which HTTP status line is correct for a successful response?',
        options: [
          '"HTTP 200 OK\\r\\n"',
          '"200 OK HTTP/1.1\\r\\n"',
          '"HTTP/1.1 200 OK\\r\\n"',
          '"GET / HTTP/1.1 200\\r\\n"'
        ],
        answer: 2,
        explanation: 'HTTP response status lines follow the format: HTTP-version SP status-code SP reason-phrase CRLF. The version comes first: "HTTP/1.1 200 OK\\r\\n".'
      },
      {
        q: 'What header tells the client how many bytes are in the response body?',
        options: [
          'Body-Size',
          'Response-Length',
          'Content-Length',
          'Transfer-Bytes'
        ],
        answer: 2,
        explanation: 'Content-Length is a standard HTTP header that tells the client the exact number of bytes in the response body. Without it, the client may not know when the response ends (unless using Transfer-Encoding: chunked or Connection: close with the server closing after sending).'
      }
    ]
  },

  'ch83': {
    title: 'Chapter 83 Quiz: select! and join!',
    questions: [
      {
        q: 'What is the key difference between tokio::join! and tokio::select!?',
        options: [
          'join! runs futures sequentially; select! runs them in parallel',
          'join! waits for all futures to complete; select! completes when the first future finishes and cancels the rest',
          'join! works only with two futures; select! can handle any number',
          'join! returns a Vec of results; select! returns only the first result'
        ],
        answer: 1,
        explanation: 'join! drives all futures concurrently and collects all results. select! polls all futures concurrently but completes (and drops the others) as soon as one branch is ready.'
      },
      {
        q: 'When should you use tokio::try_join! instead of tokio::join!?',
        options: [
          'When you want to ignore errors from individual futures',
          'When the futures return Result<T, E> and you want to short-circuit on the first Err',
          'When you have more than two futures to join',
          'When the futures may panic and you want to catch the panic'
        ],
        answer: 1,
        explanation: 'try_join! is the error-aware version of join!. If any branch returns Err, try_join! immediately returns that Err, cancelling all other futures. join! does not handle Result — it collects all values regardless.'
      },
      {
        q: 'You use select! to race two tasks: a database query (500ms) and a timeout (100ms). The timeout wins. What happens to the database query?',
        options: [
          'It continues running in the background as a detached task',
          'It is paused and can be resumed later',
          'Its Future is dropped, cancelling it at its current .await point',
          'It returns an error value that you can inspect in the timeout branch'
        ],
        answer: 2,
        explanation: 'When one select! branch wins, all other branch Futures are dropped immediately. Dropping a Future cancels it at its last .await suspension point. Resources held by the cancelled Future are freed via Drop.'
      },
      {
        q: 'What is the idiomatic way to implement a timeout for an async operation using Tokio primitives?',
        options: [
          'Spawn the operation on a thread with a watchdog timer',
          'Use select! to race the operation against tokio::time::sleep(timeout_duration)',
          'Use join! with a sleep future and ignore whichever finishes last',
          'Call operation().await with a duration argument added to the Future'
        ],
        answer: 1,
        explanation: 'Race the operation against a sleep future in select!. If sleep wins, the operation is cancelled. Tokio also provides tokio::time::timeout() as a convenience wrapper for exactly this pattern.'
      },
      {
        q: 'A select! loop receives from a channel in one branch and checks a shutdown signal in another. Why is recv() considered "cancellation-safe" in this usage?',
        options: [
          'Because recv() holds a lock that prevents message loss during cancellation',
          'Because if the recv branch is cancelled (the other branch wins), the message stays in the channel and will be received in the next iteration',
          'Because Tokio automatically re-queues cancelled recv calls',
          'Because mpsc channels clone all messages before delivery'
        ],
        answer: 1,
        explanation: 'A message is only removed from the channel when recv() returns Ok with the message. If recv() is cancelled mid-poll (before returning), it has not consumed any message. The message remains in the channel, ready to be received in the next loop iteration.'
      }
    ]
  },

  'ch84': {
    title: 'Chapter 84 Quiz: Cancellation & Backpressure',
    questions: [
      {
        q: 'What is the most idiomatic way to cancel a Future that is not yet spawned (still a local variable)?',
        options: [
          'Call future.cancel()',
          'Send a cancellation token through a channel',
          'Simply drop the Future — Rust automatically cancels it when it is dropped',
          'Call tokio::runtime::cancel_future(future)'
        ],
        answer: 2,
        explanation: 'Futures in Rust are cancelled by dropping them. When a Future is dropped, execution stops at the current .await point and all held resources are freed via Drop. There is no explicit cancel() method needed.'
      },
      {
        q: 'What does JoinHandle::abort() do?',
        options: [
          'It panics the spawned task immediately',
          'It sends a cancellation signal to the spawned task, which is then dropped at its next .await point',
          'It waits for the task to complete naturally and then returns its result',
          'It moves the task to a lower-priority queue but does not stop it'
        ],
        answer: 1,
        explanation: 'abort() schedules the spawned task for cancellation. The task is dropped at its next await point (or immediately if it is currently running). Awaiting the handle after abort() returns Err with is_cancelled() == true.'
      },
      {
        q: 'What is backpressure in the context of async channels?',
        options: [
          'The CPU pressure caused by too many concurrent tasks',
          'A mechanism where a fast producer is slowed down when a slow consumer\'s buffer is full',
          'The latency added by context switching between tasks',
          'The memory used by unprocessed messages accumulating in a channel'
        ],
        answer: 1,
        explanation: 'Backpressure means the consumer can signal to the producer to slow down. In bounded channels, this happens automatically: send() .awaits (suspends) when the buffer is full, naturally throttling the producer to match the consumer\'s pace.'
      },
      {
        q: 'Why is mpsc::unbounded_channel() potentially dangerous in a production system?',
        options: [
          'Because it is not thread-safe and can cause data races',
          'Because unbounded channels can only hold string types',
          'Because a producer that outpaces its consumer will grow the channel buffer without limit, potentially crashing the process with out-of-memory',
          'Because unbounded channels disable the Tokio work-stealing scheduler'
        ],
        answer: 2,
        explanation: 'An unbounded channel has no backpressure. If the producer sends faster than the consumer processes, messages accumulate in memory. In a long-running server under sustained load this leads to ever-growing memory usage and eventual OOM.'
      },
      {
        q: 'What is tokio::sync::Semaphore used for in async Rust?',
        options: [
          'It is a special kind of future that always returns Poll::Pending',
          'It limits the number of concurrent tasks or operations by issuing permits — tasks wait if no permits are available',
          'It signals between tasks the same way a Unix semaphore signals between processes',
          'It prevents async tasks from being cancelled by the runtime'
        ],
        answer: 1,
        explanation: 'A Semaphore holds a fixed number of permits. Each task acquires a permit before proceeding and releases it when done. If all permits are taken, further acquire() calls wait. This naturally limits concurrency, which is another form of backpressure.'
      }
    ]
  }
});
