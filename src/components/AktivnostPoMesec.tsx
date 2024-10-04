import { useEffect, useState } from "react";
import { AktivnostPoMesecInterface } from "../interfaces/AktivnostPoMesecInterface";
import { Link } from "./LinkBase";
import { Typography } from "@mui/material";
import { Bar } from "react-chartjs-2";
import { ChartOptions } from "chart.js";

const chartTitleSx = () => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 1,
    fontSize: "1.5rem",
    fontWeight: "bold",
    paddingBottom: 4,
    color: '#32355c',
});

const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
        legend: {
            display: false,
            position: 'top',
        },
        title: {
            display: false,
        },
    },
    scales: {
        x: {
            title: {
                display: true,
                text: 'Година - месец',
            },
            stacked: false,
            ticks: {
                autoSkip: false,
                maxRotation: 45,
                minRotation: 45,
                font: {
                    size: 12,
                },
                stepSize: 2,
            },
            beginAtZero: true,
        },
        y: {
            title: {
                display: false,
                text: 'Потрошувачка по месец',
            },
            stacked: false,
            ticks: {
                font: {
                    size: 8,
                },
            }
        },
    },
};

const monthsOrder = [
    '01', '02', '03', '04', '05', '06',
    '07', '08', '09', '10', '11', '12'
];

const AktivnostPoMesec: React.FC = () => {
    const [data, setData] = useState<AktivnostPoMesecInterface[]>([]);

    useEffect(() => {
        fetch(`${Link}/api/DataStatistics/PortalAktivnostPoMesec`, {
            method: "get",
            headers: {
                "ngrok-skip-browser-warning": "69420",
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new TypeError("Received content is not JSON");
                }
                return response.json();
            })
            .then((data: AktivnostPoMesecInterface[]) => {
                setData(data);
            })
            .catch((err) => console.error('Error fetching data:', err));
    });

    const dataByMonth = data.reduce((prev, current) => {
        if (Object.keys(prev).includes(current.month)) {
            prev[current.month] += current.totalSpent;
        } else {
            prev[current.month] = current.totalSpent;
        }
        return prev;
    }, {} as { [key: string]: number });

    const sortedMonths = Object.keys(dataByMonth).sort((a, b) => {
        const [yearA, monthA] = a.split('-');
        const [yearB, monthB] = b.split('-');
        return yearA === yearB
            ? monthsOrder.indexOf(monthA) - monthsOrder.indexOf(monthB)
            : parseInt(yearA) - parseInt(yearB);
    });

    const chartData = {
        labels: sortedMonths,
        datasets: [
            {
                data: sortedMonths.map((month) => dataByMonth[month]),
                backgroundColor: ['rgb(41, 176, 190)'],
            },
        ],
    }

    return (
        <>
            <Typography component="label" variant="body2" sx={chartTitleSx()}>Активности по месец</Typography>
            <Bar
                data={chartData}
                options={chartOptions}
                height={200}
            />
        </>
    );
};

export default AktivnostPoMesec;