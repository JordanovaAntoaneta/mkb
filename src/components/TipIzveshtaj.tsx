import { Box, FormControl, MenuItem, Select, Typography } from "@mui/material";
import { Chart, ChartOptions } from "chart.js";
import { useEffect, useState } from "react";
import { Bar } from 'react-chartjs-2';
import { TipIzvestajInterface } from "../interfaces/TipIzvestajInterface";
import { Link } from "./LinkBase";
import zoomPlugin from 'chartjs-plugin-zoom';

Chart.register(zoomPlugin);

const chartTitleSx = () => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 1,
    fontSize: "1.5rem",
    fontWeight: "bold",
    paddingBottom: 4,
    color: '#32355c',
});

function findSecondUpper(str: string) {
    let res: any;
    let flag = true;
    let alphabet = ['А', 'Б', 'В', 'Г', 'Д', 'Ѓ', 'Е', 'Ж', 'З', 'Ѕ', 'И', 'Ј', 'К', 'Л', 'Љ', 'М', 'Н', 'Њ', 'О', 'П', 'Р', 'С', 'Т', 'Ќ', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Џ', 'Ш'];
    for (var i = 0; i < str.length; ++i) {
        if (flag === true) {
            flag = false;
        } else {
            if (alphabet.includes(str[i])) {
                res = i;
                break;
            }
        }
    }
    return res;
}

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
                text: 'Вкупен број на побарани извештаи',
            },
            stacked: false,
            ticks: {
                autoSkip: false,
                maxRotation: 0,
                minRotation: 0,
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
                text: 'Компанија',
            },
            stacked: false,
            ticks: {
                font: {
                    size: 8,
                },
                callback: function (tickValue, index, ticks) {
                    let arr = new Array();
                    let indeks: number;
                    let str: string;
                    ticks.forEach((tick: any) => {
                        if (tick.value === tickValue) {
                            let label = this.getLabelForValue(tick.value);
                            if (label.toString().length > 35) {
                                indeks = findSecondUpper(label);
                                let res = '...' + label.substring(indeks, indeks + 21) + '...';
                                if (res === '......')
                                    res = '...' + label.substring(0, 30) + '...';
                                arr.push(res);
                            } else {
                                arr.push(label);
                            }
                        }

                    });
                    return arr;
                },
            }
        },
    },
};

const TipIzveshtaj: React.FC = () => {
    const [data, setData] = useState<TipIzvestajInterface[]>([]);
    const [filteredData, setFilteredData] = useState<TipIzvestajInterface[]>([]);
    const [choice, setChoice] = useState<string>('default');

    useEffect(() => {
        fetch(`${Link}/api/DataStatistics/TipIzvestaj/${choice}`, {
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
            .then((data: TipIzvestajInterface[]) => {
                setData(data);
                setFilteredData(data);
            })
            .catch((err) => console.error('Error fetching data:', err));
    }, [choice]);

    const chartData = {
        labels: filteredData.map((item) => item.companyName),
        datasets: [
            {
                label: 'Број на активности',
                data: filteredData.map((item) => item.vkupnoPobaraniIzv),
                backgroundColor: ['rgb(41, 176, 190)', 'rgb(41, 176, 190, 0.4)'],
            },
        ],
    };

    return (
        <>
            <Typography component="label" variant="body2" sx={chartTitleSx()}>Вид кориснички извештај</Typography>
            <Box>
                <FormControl sx={{ paddingBottom: '10px' }}>
                    <Select
                        onChange={(event) => setChoice(event.target.value)}
                        value={choice}
                    >
                        <MenuItem value='default' disabled>Избери тип на кориснички извештај</MenuItem>
                        <MenuItem value='0'>Сопствен извештај</MenuItem>
                        <MenuItem value='13'>Корпоративен извештај</MenuItem>
                        <MenuItem value='14'>Извештај за блокада на трансакциска сметка</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            <Bar
                data={chartData}
                options={{
                    ...chartOptions,
                    indexAxis: 'y',
                }}
                height={424}
            />
        </>
    );
}

export default TipIzveshtaj;