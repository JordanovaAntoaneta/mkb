import { Typography } from "@mui/material";
import { ChartOptions } from "chart.js";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { nacinPlakanjeInterface } from "../interfaces/NacinPlakjanjeInterface";
import { Link } from "./LinkBase";


const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
        legend: {
            display: false,
        },
        title: {
            display: false,
        },
    },
    scales: {
        x: {
            title: {
                display: true,
                text: 'Начин на плаќање',
            },
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
                text: 'Број на трансакции',
            },
        },
    },
    layout: {
        padding: {
            bottom: 10,
        },
    },
};

const chartTitleSx = () => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 1,
    fontSize: "1.5rem",
    fontWeight: "bold",
    paddingBottom: 4,
    color: '#32355c',
});

const NacinPlakjanje: React.FC = () => {
    const [data, setData] = useState<nacinPlakanjeInterface[]>([]);
    const [filteredData, setFilteredData] = useState<nacinPlakanjeInterface[]>([]);

    useEffect(() => {
        fetch(`${Link}/api/DataStatistics/NacinPlakjanje`, {
            method: "get",
            headers: new Headers({
                "Access-Control-Allow-Origin": "*",
                "ngrok-skip-browser-warning": "69420",
            }),
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
            .then((data: nacinPlakanjeInterface[]) => {
                setData(data);
                setFilteredData(data);
            })
            .catch((err) => console.error('Error fetching data:', err));
    }, []);

    const chartData = {
        labels: filteredData.map((item) => item.opisNacinPlakanje),
        datasets: [
            {
                data: filteredData.map((item) => item.vkupno_Uplati),
                backgroundColor: "rgb(41, 176, 190)",
                yAxisID: 'y',
                minBarLength: 5,
            },
        ],
    };


    return (
        <>
            <Typography component="label" variant="body2" sx={chartTitleSx()}>Начин на плаќање</Typography>
            <Bar
                data={chartData}
                options={chartOptions}
                height={200}
            />
        </>
    );
};

export default NacinPlakjanje;
