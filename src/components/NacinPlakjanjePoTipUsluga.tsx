import { CategoryScale, Chart, LinearScale, BarElement, Title, Tooltip, Legend, ChartOptions } from "chart.js";
import zoomPlugin from 'chartjs-plugin-zoom';
import { NacinPlakjanjePoTipUslugaInterface } from "../interfaces/NacinPlakjanjePoTipUslugaInterface";
import { Link } from "./LinkBase";
import { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import { Bar } from "react-chartjs-2";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, zoomPlugin);

const chartTitleSx = () => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 1,
    fontSize: "1.5rem",
    fontWeight: "bold",
    paddingBottom: 4,
    color: '#32355c',
});

const transformData = (filteredData: NacinPlakjanjePoTipUslugaInterface[]) => {
    const categories = Array.from(new Set(filteredData.map(entry => entry.opisNacinPlakanje)));
    const labels = Array.from(new Set(filteredData.map(entry => entry.opisTipUsluga)));

    const groupedData = filteredData.reduce((accumulator, entry) => {
        const opisTipUsluga = entry.opisTipUsluga;

        if (!accumulator[opisTipUsluga]) {
            accumulator[opisTipUsluga] = {};
            categories.forEach(category => accumulator[opisTipUsluga][category] = 0);
        }

        if (categories.includes(entry.opisNacinPlakanje)) {
            accumulator[opisTipUsluga][entry.opisNacinPlakanje] += entry.vkupno;
        }

        return accumulator;
    }, {} as { [opisTipUsluga: string]: { [category: string]: number } });

    return { groupedData, categories, labels };
};

const NacinPlakjanjePoTipUsluga: React.FC = () => {
    const [data, setData] = useState<NacinPlakjanjePoTipUslugaInterface[]>([]);
    const [filteredData, setFilteredData] = useState<NacinPlakjanjePoTipUslugaInterface[]>([]);

    useEffect(() => {
        fetch(`${Link}/api/DataStatistics/NacinPlakjanjePoTipUsluga`, {
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
            .then((data: NacinPlakjanjePoTipUslugaInterface[]) => {
                setData(data);
                setFilteredData(data);
            })
            .catch((err) => console.error('Error fetching data:', err));
    }, []);

    const sum: number = filteredData.reduce((accumulator, item) => accumulator + item.vkupno, 0);

    const scaledData = filteredData.map((item) => ({
        ...item,
        vkupno: (item.vkupno / sum) * 100,
    }));

    const { groupedData, categories, labels } = transformData(scaledData);

    const chartData = {
        labels: labels,
        datasets: categories.map((category, index) => ({
            label: category,
            data: labels.map(label => {
                return groupedData[label][category].toFixed(2);
            }),
            backgroundColor: [
                'rgb(82, 227, 242)',
                'rgb(47, 196, 212)',
                'rgb(41, 176, 190)',
                'rgb(19, 131, 143)',
            ][index % 4],
        })),
    };

    const chartOptions: ChartOptions<'bar'> = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
            },
            title: {
                display: false,
            },
            tooltip: {
                // callbacks: {
                //     label: function (context) {
                //         filteredData.map(item => {
                //             if (item.opisTipUsluga === context.label) {
                //                 if (item.opisNacinPlakanje === context.dataset.label) {
                //                     return ``
                //                 }
                //             }
                //         })
                //     }
                // },
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Тип на услуга',
                },
                stacked: true,
                ticks: {
                    autoSkip: false,
                    maxRotation: 0,
                    minRotation: 0,
                },
            },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: 'Процент на плаќања',
                },
                stacked: true,
                ticks: {
                    stepSize: 5,
                }
            },
        },
    };

    return (
        <>
            <Typography component="label" variant="body2" sx={chartTitleSx()}>Начин плаќање по тип услуга</Typography>
            <Bar data={chartData} options={chartOptions} height={200} />
        </>
    );
}

export default NacinPlakjanjePoTipUsluga;
