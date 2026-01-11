import { TaskFormDialog } from '@/components/tasks/TaskFormDialog';
import { EisenhowerMatrix } from '@/components/tasks/EisenhowerMatrix';
import { Toaster } from '@/components/ui/toast';

function App() {
	return (
		<div
			className="min-h-screen bg-fixed bg-center bg-no-repeat bg-cover"
			style={{
				backgroundImage:
					"url('/images/shutter-speed-3LXPDYb83MY-unsplash.jpg')",
			}}
		>
			{/* Subtle overlay for better readability */}
			<div className="min-h-screen">
				{/* Trello-style Header */}
				<header className="bg-white/80 border-b border-[#DFE1E6] px-4 py-3 sticky top-0 z-10 shadow-sm">
					<div className="flex items-center justify-between mx-auto max-w-7xl">
						<div className="flex items-center gap-3">
							<div className="flex items-center gap-2">
								{/* <div className="w-8 h-8 bg-[#0079BF] rounded flex items-center justify-center">
									<svg
										className="w-5 h-5 text-white"
										fill="currentColor"
										viewBox="0 0 24 24"
									>
										<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4V7h3v4h3V7h3v7z" />
									</svg>
								</div> */}
								{/* <div className="w-8 h-8 bg-[#0079BF] rounded flex items-center justify-center"> */}
								<span className="text-2xl text-white">🎯</span>
								{/* </div> */}
								<h1 className="text-xl font-bold text-[#172B4D]">
									Priority Metrix
								</h1>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<TaskFormDialog mode="add" />
						</div>
					</div>
				</header>

				{/* Main Content - Eisenhower Matrix */}
				<main className="py-6 mx-auto max-w-7xl">
					<EisenhowerMatrix />
				</main>

				{/* Toast Provider */}
				<Toaster />
			</div>
		</div>
	);
}

export default App;
