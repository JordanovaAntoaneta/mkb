import { useEffect, useState } from "react";
import { AktivnostiPoStatusPretplataInterface } from "../interfaces/AktivnostiPoStatusPretplataInterface";
import { ChartOptions } from "chart.js";
import { Typography } from "@mui/material";
import { Bar } from "react-chartjs-2";
import { Link } from "./LinkBase";

const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    indexAxis: 'y',
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
                text: 'Број на активности',
            },
            stacked: false,
            ticks: {
                autoSkip: false,
            },
        },
        y: {
            title: {
                display: true,
                text: 'Активности',
            },
            ticks: {
                autoSkip: false,
                maxRotation: 0,
                minRotation: 0,
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

const AktivnostiPoStatusPretplata: React.FC = () => {
    const [data, setData] = useState<AktivnostiPoStatusPretplataInterface[]>([]);
    const [filteredData, setFilteredData] = useState<AktivnostiPoStatusPretplataInterface[]>([]);

    useEffect(() => {
        fetch(`${Link}/api/DataStatistics/AktivnostiPoStatusPretplata`, {
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
            .then((data: AktivnostiPoStatusPretplataInterface[]) => {
                setData(data);
                setFilteredData(data);
            })
            .catch((err) => console.error('Error fetching data:', err));
    }, []);

    const chartData = {
        labels: filteredData.map((item) => item.opisStatusPretplata),
        datasets: [
            {
                data: filteredData.map((item) => item.br_Aktivnosti),
                backgroundColor: 'rgb(41, 176, 190)',
                minBarLength: 5,
            },
        ],
    };

    return (
        <>
            <Typography component="label" variant="body2" sx={chartTitleSx()}>
                Активности по статус на претплата
            </Typography>
            <Bar
                data={chartData}
                options={chartOptions}
                height={200}
            />
        </>
    );
};

export default AktivnostiPoStatusPretplata;
