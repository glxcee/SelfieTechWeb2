import './notification.css'

export default function NotificationPage() {
    return (           
        <div className="rounded-t sm:px-6 max-w-full sm:max-w-sm mx-auto p-0">
            <div className="overflow-hidden bg-white shadow dark:bg-gray-800 sm:rounded-md">
                <ul className="divide-y divide-gray-200 max-h-60 overflow-auto">
                    <li>
                        <a className="block hover:bg-gray-50 dark:hover:bg-gray-900">
                            <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-gray-700 text-md dark:text-white md:truncate">
                                        Increase sales by 10% year over year
                                    </p>
                                    <div className="flex flex-shrink-0 ml-2">
                                        <p className="inline-flex px-2 text-xs font-semibold leading-5 text-green-800 bg-green-100 rounded-full">
                                            On-Track
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                    <div className="sm:flex">
                                        <p className="flex items-center font-light text-gray-500 text-md dark:text-gray-300">
                                            January 7, 2020
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </a>
                    </li>
                    <li>
                        <a className="block hover:bg-gray-50 dark:hover:bg-gray-900">
                            <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-gray-700 text-md dark:text-white md:truncate">
                                        Increase newsletter subscribers by 500
                                    </p>
                                    <div className="flex flex-shrink-0 ml-2">
                                        <p className="inline-flex px-2 text-xs font-semibold leading-5 text-green-800 bg-green-100 rounded-full">
                                            To do
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                    <div className="sm:flex">
                                        <p className="flex items-center font-light text-gray-500 text-md dark:text-gray-300">
                                            Jun 14, 2020
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </a>
                    </li>
                    <li>
                        <a className="block hover:bg-gray-50 dark:hover:bg-gray-900">
                            <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-gray-700 text-md dark:text-white md:truncate">
                                        Increase customer satisfaction rating by 10 points
                                    </p>
                                    <div className="flex flex-shrink-0 ml-2">
                                        <p className="inline-flex px-2 text-xs font-semibold leading-5 text-green-800 bg-green-100 rounded-full">
                                            Backlog
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                    <div className="sm:flex">
                                        <p className="flex items-center font-light text-gray-500 text-md dark:text-gray-300">
                                            December 10, 2020
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </a>
                    </li>
                </ul>
                <div className="w-full p-4"> {/* Puoi mantenere il padding qui per il bottone */}
                    <button type="button" className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-indigo-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg">
                        View all
                    </button>
                </div>
            </div>
        </div>
    )
}
