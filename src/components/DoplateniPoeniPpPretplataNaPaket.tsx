import { useEffect, useState } from "react";
import { KompaniiKoiDoplatilePoeniInterface } from "../interfaces/KompaniiKoiDoplatilePoeniInterface";
import { ChartOptions } from "chart.js";
import { Typography } from "@mui/material";
import { Bar } from "react-chartjs-2";
import { Link } from "./LinkBase";
import { PoeniPoPretplataNaPaketInterface } from "../interfaces/PoeniPoPretplataNaPaketInterface";

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

const chartTitleSx = () => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 1,
    fontSize: "1.5rem",
    fontWeight: "bold",
    paddingBottom: 4,
    color: '#32355c',
});

const KompaniiKoiDoplatilePoeniPoPretplataNaPaket: React.FC = () => {
    const [data, setData] = useState<PoeniPoPretplataNaPaketInterface[]>([]);
    const [filteredData, setFilteredData] = useState<PoeniPoPretplataNaPaketInterface[]>([]);

    useEffect(() => {
        fetch(`${Link}/api/DataStatistics/KompaniiKoiDoplatileZaPoeniPoslePretplataNaPaket`, {
            method: "get",
            headers: new Headers({
                "Access-Control-Allow-Origin": "*",
                "ngrok-skip-browser-warning": "69420",
            }),
        })
            .then((response) => {
                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new TypeError("Received content is not JSON");
                }
                return response.json();
            })
            .then((data: PoeniPoPretplataNaPaketInterface[]) => {
                setData(data);
                setFilteredData(data);
            })
            .catch((err) => console.error('Error fetching data:', err));
    }, []);

    const chartData = {
        labels: filteredData.map((item) => item.companyName),
        datasets: [
            {
                label: 'Поени',
                data: filteredData.map((item) => item.dopolnitelniPoeni),
                backgroundColor: 'rgb(41, 176, 190)',
                minBarLength: 5,
            },
        ],
    };

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
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let packages: string[] = [];
                        data.forEach((item: PoeniPoPretplataNaPaketInterface) => {
                            if (item.companyName === context.label) {
                                packages.push(item.companyName.trim());
                            }
                        });
                        let arr = new Array();
                        arr.push(`Број на доплатени поени: ${context.parsed.y}`);
                        return arr;
                    },
                }
            },
        },
        scales: {
            x: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: 'Број на доплатени поени',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Компании',
                },
                stacked: true,
                ticks: {
                    autoSkip: false,
                    maxRotation: 0,
                    minRotation: 0,
                    callback: function (tickValue, index, ticks) {
                        let arr = new Array();
                        let indeks: number;
                        let str: string;
                        ticks.forEach((tick: any) => {
                            if (tick.value === tickValue) {
                                let label = this.getLabelForValue(tick.value);
                                if (label.toString().length > 35) {
                                    indeks = findSecondUpper(label);
                                    let res = '...' + label.substring(indeks, indeks + 20) + '...';
                                    arr.push(res);
                                }
                            }

                        });
                        return arr;
                    },
                },
            },
        },
        layout: {
            padding: {
                bottom: 10,
            },
        },
    };

    return (
        <>
            <Typography component="label" variant="body2" sx={chartTitleSx()}>Компании кои доплатиле за поени после претплата на пакет</Typography>
            <Bar
                data={chartData}
                options={chartOptions}
                height={200}
            />
        </>
    );

};

export default KompaniiKoiDoplatilePoeniPoPretplataNaPaket;